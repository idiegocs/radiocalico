# Environment Configuration Guide

This document describes the multi-environment setup for the Radio Calico application.

## Quick Start

### Development Environment
```bash
npm run docker:dev              # Start development
npm run docker:dev:build        # Start with rebuild
```
**Access:**
- Application: http://localhost:3000
- Database: localhost:5432
- Adminer (DB UI): http://localhost:8080

### Production Environment
```bash
npm run docker:prod             # Start production
npm run docker:prod:build       # Start with rebuild
```
**Access:**
- Application: http://localhost:3001
- Database: localhost:5433
- Adminer: Not available (security)

### Stop Services
```bash
npm run docker:down             # Stop all containers
```

## Environment Comparison

| Feature | Development | Production |
|---------|------------|------------|
| **App Port** | 3000 | 3001 |
| **Database Port** | 5432 | 5433 |
| **Database Name** | radiocalico_db_dev | radiocalico_db_prod |
| **Adminer** | Yes (port 8080) | No |
| **Hot Reload** | Yes | No |
| **Source Volumes** | Mounted | Not mounted |
| **Command** | `npm run dev` | `npm start` |
| **Container Prefix** | _dev | _prod |
| **Restart Policy** | unless-stopped | always |
| **Resource Limits** | No | Yes (1 CPU, 1GB RAM) |

## Configuration Files

### Environment Variables
```
.env.development          # Dev config (in git)
.env.production          # Prod config (in git) - UPDATE PASSWORDS!
.env                     # Local overrides (gitignored)
.env.development.local   # Local dev overrides (gitignored)
.env.production.local    # Local prod overrides (gitignored)
```

### Docker Compose Files
```
docker-compose.yml           # Base configuration
docker-compose.dev.yml      # Development overrides
docker-compose.prod.yml     # Production overrides
```

## Running Both Environments Simultaneously

The different ports and container names allow running both environments at the same time:

```bash
# Start both environments
npm run docker:dev
npm run docker:prod

# Check running containers
docker ps

# View logs
npm run docker:logs         # Development logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f app  # Production logs
```

## Database Access

### Development Database
- Host: localhost
- Port: 5432
- User: radio_user
- Password: dics
- Database: radiocalico_db_dev
- Adminer: http://localhost:8080

### Production Database
- Host: localhost
- Port: 5433
- User: radio_user
- Password: CHANGE_THIS_PASSWORD_IN_PRODUCTION
- Database: radiocalico_db_prod
- **Important:** Change password before deployment!

## Container Names

### Development
- `radiocalico_app_dev` - Application server
- `radiocalico_db_dev` - PostgreSQL database
- `radiocalico_adminer_dev` - Database UI

### Production
- `radiocalico_app_prod` - Application server
- `radiocalico_db_prod` - PostgreSQL database

## Useful Commands

```bash
# View logs
npm run docker:logs              # Development app logs
npm run docker:logs:db           # Development DB logs
docker logs radiocalico_app_prod -f    # Production app logs
docker logs radiocalico_db_prod -f     # Production DB logs

# Rebuild containers
npm run docker:dev:build
npm run docker:prod:build

# Stop specific environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Execute commands in container
docker exec -it radiocalico_app_dev sh
docker exec -it radiocalico_db_dev psql -U radio_user -d radiocalico_db_dev

# Database backup
docker exec radiocalico_db_dev pg_dump -U radio_user radiocalico_db_dev > backup_dev.sql
docker exec radiocalico_db_prod pg_dump -U radio_user radiocalico_db_prod > backup_prod.sql
```

## Security Notes

1. **Production Passwords**: Always change default passwords in `.env.production` before deploying
2. **Environment Files**: `.env.development` and `.env.production` are tracked in git for team consistency
3. **Local Overrides**: Use `.env.development.local` or `.env.production.local` for local password overrides (not tracked in git)
4. **Adminer**: Only available in development for security reasons
5. **Network Isolation**: Each environment uses the same network but different container names

## Troubleshooting

### Port Conflicts
If you get port conflicts, check if another service is using the ports:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :5433
```

### Container Name Conflicts
If you get container name conflicts:
```bash
docker ps -a  # List all containers
docker rm -f container_name  # Remove specific container
```

### Database Connection Issues
```bash
# Check database health
docker exec radiocalico_db_dev pg_isready -U radio_user
docker exec radiocalico_db_prod pg_isready -U radio_user

# View database logs
docker logs radiocalico_db_dev
docker logs radiocalico_db_prod
```

### Reset Everything
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes all data!)
docker volume rm radiocalico_postgres_data

# Rebuild from scratch
npm run docker:dev:build
```
