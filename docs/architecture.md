# Arquitectura de Disc Radio

## Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        UI[HTML/CSS/JS]
        Classes[JavaScript Classes]
        AudioAPI[Web Audio API]
        Canvas[Canvas API]

        UI --> Classes
        Classes --> AudioAPI
        Classes --> Canvas
    end

    subgraph "Servidor Node.js"
        Server[server.js]
        Middleware[Express Middleware]
        Static[Archivos Estáticos]

        Server --> Middleware
        Server --> Static
    end

    subgraph "Backend API (src/)"
        Routes[Routes]
        Controllers[Controllers]
        Services[Services]
        Config[Config]

        Routes --> Controllers
        Controllers --> Services
        Controllers --> Config
    end

    subgraph "Base de Datos"
        PostgreSQL[(PostgreSQL)]
    end

    subgraph "APIs Externas"
        MusicBrainz[MusicBrainz API]
        CoverArt[Cover Art Archive]
    end

    UI -->|HTTP Requests| Server
    Server -->|/api/songs/*| Routes
    Config -->|Pool de Conexiones| PostgreSQL
    Services -->|Búsqueda| MusicBrainz
    Services -->|Carátulas| CoverArt

    style Cliente fill:#e1f5ff
    style Servidor fill:#fff4e1
    style Backend fill:#e8f5e9
    style Base de Datos fill:#f3e5f5
    style APIs Externas fill:#ffe0e0
```

## Estructura de Carpetas

```mermaid
graph LR
    Root[radiocalico/]

    Root --> Src[src/]
    Root --> Public[public/]
    Root --> DB[database/]
    Root --> Docs[docs/]
    Root --> Docker[Docker files]

    Src --> Config[config/]
    Src --> Controllers[controllers/]
    Src --> Routes[routes/]
    Src --> Services[services/]

    Public --> Audio[audio/]
    Public --> CSS[css/]
    Public --> JS[js/]
    Public --> Images[images/]
    Public --> HTML[index.html]

    DB --> Migrations[migrations/]

    Config --> DBConfig[database.js]
    Controllers --> SongCtrl[songsController.js]
    Routes --> SongRoutes[songs.js]
    Services --> CoverService[coverArtService.js]

    style Root fill:#667BC6,color:#fff
    style Src fill:#DA7297,color:#fff
    style Public fill:#FADA7A
    style DB fill:#e1f5ff
```

## Flujo de Datos

```mermaid
flowchart TD
    Start([Usuario abre aplicación])
    Start --> LoadPage[Cargar HTML/CSS/JS]
    LoadPage --> InitApp[Inicializar RadioCalicoApp]
    InitApp --> LoadSongs[Cargar canciones desde API]

    LoadSongs --> RenderUI[Renderizar interfaz]
    RenderUI --> WaitAction{Esperar acción del usuario}

    WaitAction -->|Play| PlayFlow[Flujo de Reproducción]
    WaitAction -->|Vote| VoteFlow[Flujo de Votación]
    WaitAction -->|Expand| ExpandFlow[Flujo de Descripción]

    PlayFlow --> UpdateDB1[Actualizar play_count]
    PlayFlow --> StartVisualizer[Iniciar visualizador]
    PlayFlow --> ExtractCover[Extraer carátula MP3]
    PlayFlow --> WaitAction

    VoteFlow --> UpdateDB2[Actualizar votes]
    VoteFlow --> AnimateUI[Animar feedback]
    VoteFlow --> WaitAction

    ExpandFlow --> ToggleDesc[Toggle descripción]
    ExpandFlow --> AnimateDots[Animar puntos]
    ExpandFlow --> WaitAction

    style Start fill:#667BC6,color:#fff
    style PlayFlow fill:#DA7297,color:#fff
    style VoteFlow fill:#FADA7A
    style ExpandFlow fill:#e1f5ff
```

## Capas de la Aplicación

```mermaid
graph TB
    subgraph "Capa de Presentación"
        HTML[HTML5]
        CSS[CSS3 + Animaciones]
        UI[Interfaz de Usuario]
    end

    subgraph "Capa de Lógica (Frontend)"
        AppClass[RadioCalicoApp]
        PlayerClass[AudioPlayer]
        VisualizerClass[AudioVisualizer]
        ManagerClass[SongManager]
    end

    subgraph "Capa de Transporte"
        HTTP[HTTP/REST API]
        Fetch[Fetch API]
    end

    subgraph "Capa de Aplicación (Backend)"
        Express[Express Server]
        RoutesLayer[Routes Layer]
        ControllerLayer[Controller Layer]
    end

    subgraph "Capa de Servicios"
        CoverService[Cover Art Service]
        FutureServices[Servicios Futuros]
    end

    subgraph "Capa de Datos"
        PostgreSQLDB[(PostgreSQL)]
        ExternalAPIs[APIs Externas]
    end

    HTML --> CSS
    CSS --> UI
    UI --> AppClass
    AppClass --> PlayerClass
    AppClass --> VisualizerClass
    AppClass --> ManagerClass

    ManagerClass --> HTTP
    HTTP --> Fetch
    Fetch --> Express

    Express --> RoutesLayer
    RoutesLayer --> ControllerLayer
    ControllerLayer --> CoverService
    ControllerLayer --> PostgreSQLDB
    CoverService --> ExternalAPIs

    style Capa de Presentación fill:#e1f5ff
    style Capa de Lógica fill:#fff4e1
    style Capa de Transporte fill:#e8f5e9
    style Capa de Aplicación fill:#f3e5f5
    style Capa de Servicios fill:#ffe0e0
    style Capa de Datos fill:#fff9c4
```

## Patrones de Diseño Implementados

### 1. MVC (Model-View-Controller)

```
Model (Database)
  ↓
Controller (src/controllers/)
  ↓
View (Frontend HTML/JS)
```

### 2. Service Layer Pattern

```
Controller → Service → External API
                    ↓
                Database
```

### 3. Singleton Pattern

```javascript
// CoverArtService exporta una única instancia
class CoverArtService { ... }
module.exports = new CoverArtService();
```

### 4. Factory Pattern (Frontend Classes)

```javascript
// RadioCalicoApp crea instancias de otras clases
constructor() {
    this.visualizer = new AudioVisualizer(...);
    this.player = new AudioPlayer(...);
    this.songManager = new SongManager();
}
```

## Tecnologías por Capa

| Capa | Tecnología |
|------|------------|
| Frontend UI | HTML5, CSS3, JavaScript ES6+ |
| Frontend Logic | OOP JavaScript (Classes) |
| Visualización | Web Audio API, Canvas API |
| Transporte | Fetch API, REST |
| Backend Server | Node.js, Express.js |
| Backend Architecture | MVC + Service Layer |
| Base de Datos | PostgreSQL 16 |
| Containerización | Docker, Docker Compose |
| APIs Externas | MusicBrainz, Cover Art Archive |

## Comunicación entre Componentes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant S as Server
    participant R as Routes
    participant C as Controllers
    participant SV as Services
    participant DB as Database
    participant API as External APIs

    U->>F: Interacción
    F->>S: HTTP Request
    S->>R: Route matching
    R->>C: Controller method
    C->>DB: Query
    DB-->>C: Data
    C->>SV: Service call (opcional)
    SV->>API: External request
    API-->>SV: Response
    SV-->>C: Processed data
    C-->>R: JSON
    R-->>S: Response
    S-->>F: JSON
    F-->>U: UI Update
```

## Escalabilidad y Extensibilidad

### Agregar un nuevo controlador:

1. Crear `src/controllers/newController.js`
2. Definir métodos del controlador
3. Crear `src/routes/new.js`
4. Importar en `server.js`: `app.use('/api/new', newRoutes)`

### Agregar un nuevo servicio:

1. Crear `src/services/newService.js`
2. Implementar lógica de negocio
3. Importar en el controlador que lo necesite
4. El servicio es reutilizable en múltiples controladores

### Agregar un nuevo proveedor de carátulas:

1. Abrir `src/services/coverArtService.js`
2. Implementar método `searchSpotify()` o similar
3. Agregar al método `searchCover()` como fallback
4. **No tocar el controlador** - Desacoplamiento completo

## Seguridad

- Variables de entorno para credenciales (`.env`)
- Preparación de queries SQL (prevención de SQL injection)
- Validación de entrada en controladores
- CORS configurado en Express
- Pool de conexiones a DB con límites

## Performance

- Pool de conexiones a PostgreSQL (reutilización)
- Lazy loading de imágenes (`loading="lazy"`)
- Canvas optimizado con `devicePixelRatio`
- Event delegation para listeners
- Fetch API con promesas
- Singleton para servicios

---

*Documentación generada para Radio Calico v1.0*
