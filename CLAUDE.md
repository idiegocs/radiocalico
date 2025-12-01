# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Disc Radio is a Node.js web application with PostgreSQL database, designed to run in Docker containers. The application uses TypeScript, Express.js for the web server and pg for PostgreSQL database connections.

## Development Commands

### Local Development (with Docker)
```bash
docker-compose up -d          # Start all services (app, db, adminer)
docker-compose down           # Stop all services
docker-compose logs -f app    # View application logs
docker-compose restart app    # Restart the application container
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
- Adminer (web-based database manager) is accessible at http://localhost:8080
- System: PostgreSQL
- Server: db (when using Docker) or localhost
- Database credentials are in `.env` file

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
All configuration is managed through `.env` file:
- NODE_ENV: Application environment (development/production)
- APP_PORT: Application server port
- POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB: Database credentials
- POSTGRES_PORT: Database port
- ADMINER_PORT: Adminer web interface port

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
