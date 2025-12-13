# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Disc Radio is a Node.js web application with PostgreSQL database, designed to run in Docker containers. The application uses TypeScript, Express.js for the web server and pg for PostgreSQL database connections.

## Development Commands

### Docker Development (Recommended)

The application supports separate development and production environments with dedicated configurations:

```bash
# Development environment (with hot reload, adminer, debug tools)
npm run docker:dev              # Start development environment
npm run docker:dev:build        # Start development with rebuild

# Production environment (optimized, no dev tools)
npm run docker:prod             # Start production environment
npm run docker:prod:build       # Start production with rebuild

# General Docker commands
npm run docker:down             # Stop all containers
npm run docker:logs             # View application logs
npm run docker:logs:db          # View database logs

# Direct docker-compose commands (if needed)
docker-compose --env-file .env.development -f docker-compose.yml -f docker-compose.dev.yml up -d
docker-compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Local Development (without Docker)
```bash
npm install                   # Install dependencies
npm run build                 # Compile TypeScript to JavaScript (output to dist/)
npm run dev                   # Start development server with ts-node (hot reload)
npm run start:ts              # Start server with ts-node (no build needed)
npm start                     # Start production server (requires build first)
```

### Database Management
- **Development**: Adminer (web-based database manager) is accessible at http://localhost:8080
- **Production**: Adminer is not included for security reasons
- System: PostgreSQL
- Server: db (when using Docker) or localhost
- Database credentials are in environment files (`.env.development`, `.env.production`)

## Architecture

### Application Structure
- **server.ts**: Main application entry point (TypeScript)
  - Configures Express server with JSON and URL-encoded body parsing
  - Establishes PostgreSQL connection pool using environment variables
  - Binds to 0.0.0.0 to accept connections from Docker network
  - Includes global error handlers for uncaught exceptions and unhandled promise rejections
- **src/types/index.ts**: TypeScript type definitions for the application
  - Song: Database model for songs
  - APIResponse: Standardized API response format
  - CoverSearchResult: Cover art search results
  - MusicBrainz types: External API response types

### Docker Setup
The application uses a 3-container architecture:
1. **app**: Node.js application container
   - Uses Node 20 Alpine image
   - Mounts source code as volume for hot reload
   - Depends on database health check before starting
   - Runs on port 3000 (configurable via APP_PORT)

2. **db**: PostgreSQL 16 database container
   - Uses Alpine variant for smaller image size
   - Persistent storage via Docker volume (postgres_data)
   - Health check ensures database is ready before app starts
   - Exposed on port 5432

3. **adminer**: Database management UI
   - Lightweight web interface for PostgreSQL
   - Accessible on port 8080 (configurable via ADMINER_PORT)

### Database Connection
- Connection string format: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`
- Database URL is constructed in docker-compose.yml and passed via DATABASE_URL environment variable
- Connection pool is managed by pg library

### Environment Configuration

The project uses environment-specific configuration files:

#### Configuration Files Structure
```
.env.development          # Development config (tracked in git)
.env.production          # Production config (tracked in git, update passwords!)
.env                     # Local overrides (gitignored, not tracked)
.env.development.local   # Local dev overrides (gitignored)
.env.production.local    # Local prod overrides (gitignored)
```

#### Environment Variables
- **NODE_ENV**: Application environment (development/production)
- **APP_PORT**: Application server port (default: 3000)
- **POSTGRES_USER**: Database username
- **POSTGRES_PASSWORD**: Database password (CHANGE IN PRODUCTION!)
- **POSTGRES_DB**: Database name
- **POSTGRES_PORT**: Database port (default: 5432)
- **ADMINER_PORT**: Adminer web interface port (development only, default: 8080)

#### Docker Compose Files
```
docker-compose.yml           # Base configuration (shared)
docker-compose.dev.yml      # Development overrides (volumes, adminer, hot reload)
docker-compose.prod.yml     # Production overrides (optimized, no dev tools)
```

#### Key Differences Between Environments

**Development:**
- Application Port: **3000**
- Database Port: **5432**
- Adminer Port: **8080**
- Database Name: `radiocalico_db_dev`
- Container Names: `radiocalico_app_dev`, `radiocalico_db_dev`, `radiocalico_adminer_dev`
- Hot reload enabled (source code mounted as volume)
- Adminer database UI included
- Development dependencies available
- Verbose logging
- Command: `npm run dev` (nodemon with ts-node)

**Production:**
- Application Port: **3001**
- Database Port: **5433**
- Database Name: `radiocalico_db_prod`
- Container Names: `radiocalico_app_prod`, `radiocalico_db_prod`
- No volume mounts (uses built image)
- No Adminer (security)
- Optimized build
- Resource limits applied
- Command: `npm start` (compiled JavaScript)
- Always restart policy

**Note:** Different ports allow running both environments simultaneously without conflicts.

## TypeScript Configuration

### Build Process
- TypeScript source files (`.ts`) are in the root and `src/` directory
- Compiled JavaScript output goes to `dist/` directory
- Source maps and type declarations are generated for debugging

### Type Safety
- All new code must be written in TypeScript
- Use interfaces from `src/types/index.ts` for data models
- Avoid using `any` type - use proper type definitions
- Request/Response handlers must have proper Express types (Request, Response)

### Adding New Features
When adding new features:
1. Define types/interfaces in `src/types/index.ts` first
2. Use those types throughout controllers, services, and routes
3. Run `npm run build` to verify TypeScript compilation
4. Ensure no type errors before committing

## API Endpoints

- `GET /`: Health check endpoint returning welcome message
- `GET /db-test`: Database connectivity test endpoint that queries current timestamp
