# Diagramas de Secuencia - Radio Calico

Este documento contiene los diagramas de secuencia que explican los principales flujos de la aplicación.

## Tabla de Contenidos
1. [Carga Inicial de la Aplicación](#1-carga-inicial-de-la-aplicación)
2. [Reproducción de una Canción](#2-reproducción-de-una-canción)
3. [Sistema de Votación](#3-sistema-de-votación)
4. [Búsqueda de Carátulas](#4-búsqueda-de-carátulas)
5. [Arquitectura Backend](#5-arquitectura-backend)

---

## 1. Carga Inicial de la Aplicación

```mermaid
sequenceDiagram
    actor Usuario
    participant Browser
    participant Server
    participant Routes
    participant Controller
    participant DB

    Usuario->>Browser: Abre http://localhost:3000
    Browser->>Server: GET /
    Server->>Browser: index.html + CSS + JS

    Browser->>Browser: DOMContentLoaded
    Browser->>Browser: new RadioCalicoApp()
    Browser->>Browser: songManager.load()

    Browser->>Server: GET /api/songs
    Server->>Routes: /api/songs router
    Routes->>Controller: getAllSongs()
    Controller->>DB: SELECT * FROM songs
    DB-->>Controller: Canciones con votos y play_count
    Controller-->>Routes: JSON response
    Routes-->>Server: Response
    Server-->>Browser: {success: true, data: [...]}

    Browser->>Browser: songManager.render()
    Browser->>Browser: Renderiza tarjetas de canciones
    Browser->>Browser: Agrega event listeners

    loop Para cada canción sin carátula
        Browser->>Server: GET /api/songs/:id/cover
        Server->>Controller: getCover()
        Controller->>CoverArtService: searchCover(artist, title)
        CoverArtService->>MusicBrainz: Buscar release
        MusicBrainz-->>CoverArtService: Release ID
        CoverArtService->>CoverArtArchive: Verificar carátula
        CoverArtArchive-->>CoverArtService: URL carátula
        CoverArtService-->>Controller: {coverUrl, source}
        Controller-->>Browser: Carátula encontrada
        Browser->>Browser: Actualizar imagen
    end

    Browser->>Usuario: Interfaz lista
```

---

## 2. Reproducción de una Canción

```mermaid
sequenceDiagram
    actor Usuario
    participant Browser
    participant AudioPlayer
    participant AudioVisualizer
    participant Server
    participant Controller
    participant DB

    Usuario->>Browser: Click en "Reproducir"
    Browser->>AudioPlayer: playSong(song, index)

    AudioPlayer->>AudioPlayer: audio.src = song.audio_file
    AudioPlayer->>AudioPlayer: audio.play()
    AudioPlayer->>AudioPlayer: updateUI(song)
    AudioPlayer->>Browser: show player

    par Iniciar visualizador
        AudioPlayer->>AudioVisualizer: setup(audioElement)
        AudioVisualizer->>AudioVisualizer: Crear AudioContext
        AudioVisualizer->>AudioVisualizer: Crear Analyser
        AudioVisualizer->>AudioVisualizer: Configurar Canvas
        AudioPlayer->>AudioVisualizer: start()
        AudioVisualizer->>AudioVisualizer: animate() loop
        AudioVisualizer->>Browser: Dibujar barras de frecuencia
    and Registrar reproducción
        AudioPlayer->>Server: POST /api/songs/:id/play
        Server->>Controller: registerPlay(id)
        Controller->>DB: UPDATE songs SET play_count + 1
        DB-->>Controller: Canción actualizada
        Controller-->>Server: {success: true, play_count}
        Server-->>Browser: Response
        Browser->>Browser: Actualizar contador en UI
    and Extraer carátula del MP3
        AudioPlayer->>AudioPlayer: extractAlbumArt(song)
        AudioPlayer->>Browser: fetch(audio_file) as blob
        Browser-->>AudioPlayer: MP3 Blob
        AudioPlayer->>jsmediatags: read(blob)
        jsmediatags-->>AudioPlayer: ID3 tags con picture
        AudioPlayer->>AudioPlayer: Convertir a Base64
        AudioPlayer->>Browser: Actualizar imagen
    end

    Browser->>Usuario: Canción reproduciendo

    loop Mientras reproduce
        AudioVisualizer->>AudioVisualizer: getByteFrequencyData()
        AudioVisualizer->>AudioVisualizer: Dibujar barras animadas
    end

    Usuario->>Browser: Audio termina
    Browser->>AudioPlayer: onEnded event
    AudioPlayer->>AudioPlayer: playNext()
```

---

## 3. Sistema de Votación

```mermaid
sequenceDiagram
    actor Usuario
    participant Browser
    participant SongManager
    participant Server
    participant Controller
    participant DB

    Usuario->>Browser: Click en botón de corazón
    Browser->>SongManager: voteSong(songId)

    SongManager->>Server: POST /api/songs/:id/vote
    Server->>Controller: voteSong(id)

    Controller->>DB: SELECT id FROM songs WHERE id = ?
    DB-->>Controller: Canción existe

    Controller->>DB: UPDATE songs SET votes + 1
    DB-->>Controller: Canción con votos actualizados

    Controller-->>Server: {success: true, data: {votes}}
    Server-->>Browser: Response

    Browser->>SongManager: Respuesta recibida

    SongManager->>Browser: Actualizar contador en UI
    SongManager->>Browser: Agregar clase 'voted'
    SongManager->>Browser: Animación de pulso

    Browser->>Browser: setTimeout 300ms
    Browser->>SongManager: Quitar clase 'voted'

    SongManager->>SongManager: Actualizar array de canciones

    Browser->>Usuario: Feedback visual completado
```

---

## 4. Búsqueda de Carátulas

```mermaid
sequenceDiagram
    actor Sistema
    participant Browser
    participant Controller
    participant CoverArtService
    participant MusicBrainz
    participant CoverArtArchive

    Sistema->>Browser: Necesita carátula
    Browser->>Controller: GET /api/songs/:id/cover

    Controller->>DB: SELECT title, artist FROM songs
    DB-->>Controller: {title, artist}

    Controller->>CoverArtService: searchCover(artist, title)

    CoverArtService->>CoverArtService: searchMusicBrainz()

    CoverArtService->>MusicBrainz: GET /ws/2/release/?query=...
    Note right of CoverArtService: Query: artist AND recording
    MusicBrainz-->>CoverArtService: {releases: [{id, title}, ...]}

    loop Para cada release
        CoverArtService->>CoverArtService: getCoverArtArchiveUrl(releaseId)
        CoverArtService->>CoverArtArchive: HEAD /release/:id/front-500

        alt Carátula existe
            CoverArtArchive-->>CoverArtService: 200 OK
            CoverArtService-->>Controller: {coverUrl, source, release}
            Controller-->>Browser: Carátula encontrada
        else Carátula no existe
            CoverArtArchive-->>CoverArtService: 404 Not Found
            CoverArtService->>CoverArtService: Continuar con siguiente release
        end
    end

    alt Ninguna carátula encontrada
        CoverArtService-->>Controller: {coverUrl: null, source: 'none'}
        Controller-->>Browser: Sin carátula
    end

    Browser->>Browser: Usar placeholder o carátula encontrada
```

---

## 5. Arquitectura Backend

```mermaid
sequenceDiagram
    participant Client
    participant server.js
    participant Routes
    participant Controller
    participant Service
    participant Config
    participant DB

    Note over server.js: Punto de entrada
    Client->>server.js: HTTP Request

    server.js->>server.js: Express middleware
    Note right of server.js: JSON parser, URL encoder

    server.js->>Routes: app.use('/api/songs', songsRoutes)
    Note right of Routes: src/routes/songs.js

    Routes->>Routes: Buscar ruta correspondiente
    Routes->>Controller: Llamar método del controlador
    Note right of Controller: src/controllers/songsController.js

    par Operaciones del controlador
        Controller->>Config: require('../config/database')
        Config-->>Controller: pool de conexiones
        Note right of Config: src/config/database.js

        Controller->>DB: pool.query(SQL)
        DB-->>Controller: Resultado de query
    and Servicios externos (si necesario)
        Controller->>Service: Llamar método del servicio
        Note right of Service: src/services/coverArtService.js
        Service->>Service: Lógica de negocio
        Service->>External: API externa (MusicBrainz)
        External-->>Service: Respuesta
        Service-->>Controller: Resultado procesado
    end

    Controller->>Controller: Procesar datos
    Controller-->>Routes: JSON Response
    Routes-->>server.js: Response
    server.js-->>Client: HTTP Response

    Note over server.js,DB: Separación clara de responsabilidades:<br/>Routes -> Controllers -> Services -> DB
```

---

## 6. Descripción Expandible

```mermaid
sequenceDiagram
    actor Usuario
    participant Browser
    participant SongManager

    Usuario->>Browser: Página cargada
    Browser->>SongManager: render()

    SongManager->>Browser: Renderizar descripción truncada (3 líneas)
    SongManager->>Browser: Agregar botón con 3 puntos animados

    SongManager->>Browser: Verificar si está truncada
    Browser->>Browser: desc.scrollHeight > desc.clientHeight

    alt Descripción truncada
        Browser->>Browser: Mostrar botón toggle
    else Descripción completa
        Browser->>Browser: Ocultar botón toggle
    end

    Usuario->>Browser: Click en descripción o puntos
    Browser->>SongManager: toggleDescription(songId)

    SongManager->>Browser: desc.classList.toggle('expanded')
    SongManager->>Browser: toggle.classList.toggle('expanded')

    alt Expandida
        Browser->>Browser: Mostrar descripción completa
        Browser->>Browser: Cambiar título a "Leer menos"
        Browser->>Browser: Rotar puntos (animación inversa)
    else Colapsada
        Browser->>Browser: Mostrar solo 3 líneas
        Browser->>Browser: Cambiar título a "Leer más"
        Browser->>Browser: Restaurar animación de puntos
    end

    Browser->>Usuario: Feedback visual
```

---

## Notas de Implementación

### Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Frontend**: JavaScript ES6+ (Clases)
- **Base de Datos**: PostgreSQL
- **APIs Externas**: MusicBrainz + Cover Art Archive
- **Visualización**: Web Audio API + Canvas API

### Patrones de Diseño

1. **MVC (Model-View-Controller)**: Separación clara entre rutas, controladores y modelos
2. **Service Layer**: Lógica de negocio desacoplada en servicios reutilizables
3. **Singleton**: CoverArtService exporta una instancia única
4. **OOP**: Clases para AudioPlayer, AudioVisualizer, SongManager, RadioCalicoApp

### Flujo de Datos

```
Usuario → Browser (Frontend Classes)
  ↓
HTTP Request → Express Server
  ↓
Routes → Controllers → Services
  ↓
Database / External APIs
  ↓
JSON Response → Browser
  ↓
UI Update → Usuario
```

---

*Diagramas generados con [Mermaid](https://mermaid.js.org/)*
