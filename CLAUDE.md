# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Radio Calico is a Node.js web application with PostgreSQL database, designed to run in Docker containers. The application uses Express.js for the web server and pg for PostgreSQL database connections.

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
npm run dev                   # Start development server with nodemon (hot reload)
npm start                     # Start production server
```

### Database Management
- Adminer (web-based database manager) is accessible at http://localhost:8080
- System: PostgreSQL
- Server: db (when using Docker) or localhost
- Database credentials are in `.env` file

## Architecture

### Application Structure
- **server.js**: Main application entry point
  - Configures Express server with JSON and URL-encoded body parsing
  - Establishes PostgreSQL connection pool using environment variables
  - Binds to 0.0.0.0 to accept connections from Docker network
  - Includes global error handlers for uncaught exceptions and unhandled promise rejections

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

## API Endpoints

- `GET /`: Health check endpoint returning welcome message
- `GET /db-test`: Database connectivity test endpoint that queries current timestamp
