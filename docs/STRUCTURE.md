# Estructura del Proyecto

## Árbol de Directorios

```
radiocalico/
├── config/                  # Archivos de configuración
│   ├── eslint.config.js    # Configuración de ESLint
│   ├── jest.config.js      # Configuración de Jest
│   └── tsconfig.json       # Configuración de TypeScript
│
├── database/               # Migraciones de base de datos
│   └── migrations/         # Scripts SQL de migración
│
├── docker/                 # Configuración de Docker
│   ├── Dockerfile          # Imagen de Docker
│   ├── docker-compose.yml          # Configuración base
│   ├── docker-compose.dev.yml      # Override para desarrollo
│   └── docker-compose.prod.yml     # Override para producción
│
├── docs/                   # Documentación del proyecto
│   ├── architecture.md     # Documentación de arquitectura
│   ├── COVERAGE_GUIDE.md   # Guía de cobertura de tests
│   ├── ENVIRONMENTS.md     # Guía de ambientes
│   └── sequence-diagram.md # Diagramas de secuencia
│
├── env/                    # Variables de entorno
│   ├── .env                # Variables locales (gitignored)
│   ├── .env.development    # Variables para desarrollo (tracked)
│   └── .env.production     # Variables para producción (tracked)
│
├── public/                 # Archivos estáticos
│   ├── css/                # Estilos CSS
│   ├── images/             # Imágenes
│   ├── js/                 # JavaScript del cliente
│   └── index.html          # Página principal
│
├── src/                    # Código fuente de la aplicación
│   ├── config/             # Configuración de la app
│   │   └── database.ts     # Configuración de PostgreSQL
│   ├── controllers/        # Controladores
│   │   └── songsController.ts
│   ├── routes/             # Rutas de la API
│   │   └── songs.ts
│   ├── services/           # Lógica de negocio
│   │   └── coverArtService.ts
│   └── types/              # Definiciones de TypeScript
│       └── index.ts
│
├── tests/                  # Tests (si existen)
│
├── .dockerignore           # Archivos ignorados por Docker
├── .gitignore              # Archivos ignorados por Git
├── CLAUDE.md               # Instrucciones para Claude Code
├── package.json            # Dependencias y scripts npm
├── README.md               # Documentación principal
├── server.ts               # Punto de entrada de la aplicación
└── STRUCTURE.md            # Este archivo
```

## Descripción de Carpetas

### `/config`
Contiene todos los archivos de configuración para herramientas de desarrollo:
- **eslint.config.js**: Reglas de linting para mantener calidad de código
- **jest.config.js**: Configuración para pruebas unitarias
- **tsconfig.json**: Configuración del compilador de TypeScript

### `/database`
Gestión de esquema y datos de la base de datos:
- **migrations/**: Scripts SQL ejecutados en orden para configurar la base de datos

### `/docker`
Todo lo relacionado con Docker y contenedores:
- **Dockerfile**: Define la imagen de la aplicación
- **docker-compose.yml**: Configuración base compartida
- **docker-compose.dev.yml**: Configuración específica para desarrollo
- **docker-compose.prod.yml**: Configuración específica para producción

### `/env`
Variables de entorno para diferentes ambientes:
- **`.env`**: Configuración local personal (no se hace commit)
- **`.env.development`**: Variables para desarrollo (tracked en git)
- **`.env.production`**: Variables para producción (tracked en git)

### `/docs`
Documentación técnica del proyecto:
- Guías de desarrollo
- Diagramas de arquitectura
- Documentación de APIs
- Guías de deployment

### `/public`
Archivos servidos directamente al navegador:
- HTML, CSS, JavaScript del cliente
- Imágenes y assets estáticos

### `/src`
Código fuente TypeScript de la aplicación:
- **config/**: Configuración de servicios (DB, etc.)
- **controllers/**: Lógica de manejo de requests
- **routes/**: Definición de endpoints de la API
- **services/**: Lógica de negocio
- **types/**: Tipos TypeScript compartidos

## Archivos de Configuración de Ambiente

Todos los archivos de configuración de ambiente están en `/env`:

- **`env/.env`**: Configuración local personal (no se hace commit)
- **`env/.env.development`**: Configuración para ambiente de desarrollo (tracked)
- **`env/.env.production`**: Configuración para ambiente de producción (tracked)

## Scripts NPM Principales

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar TypeScript

# Docker
npm run docker:dev       # Iniciar ambiente de desarrollo
npm run docker:prod      # Iniciar ambiente de producción
npm run docker:down      # Detener todos los contenedores

# Testing & Quality
npm run test             # Ejecutar tests
npm run lint             # Verificar código
npm run lint:fix         # Corregir problemas de linting
```

## Convenciones

1. **TypeScript**: Todo el código debe estar tipado
2. **Imports**: Usar rutas relativas desde src/
3. **Config**: Los archivos de configuración están en `/config`
4. **Docs**: Documentación técnica va en `/docs`
5. **Tests**: Tests cerca del código que prueban
