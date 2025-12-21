#!/bin/bash
# Script para aplicar migraciones a la base de datos PostgreSQL
# Uso: ./apply-migration.sh <numero_migracion>
# Ejemplo: ./apply-migration.sh 005

set -e

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detectar entorno (dev o prod)
ENV=${1:-dev}
MIGRATION_FILE=${2:-}

# Configuración según entorno
if [ "$ENV" = "prod" ]; then
    CONTAINER_NAME="radiocalico_db_prod"
    DB_NAME="radiocalico_db_prod"
    DB_USER="radio_user"
else
    CONTAINER_NAME="radiocalico_db_dev"
    DB_NAME="radiocalico_db_dev"
    DB_USER="radio_user"
fi

echo -e "${YELLOW}Aplicando migraciones en entorno: $ENV${NC}"
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo ""

# Si se especifica un archivo de migración, aplicar solo ese
if [ -n "$MIGRATION_FILE" ]; then
    if [ -f "migrations/$MIGRATION_FILE" ]; then
        echo -e "${GREEN}Aplicando migración: $MIGRATION_FILE${NC}"
        docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "migrations/$MIGRATION_FILE"
        echo -e "${GREEN}✓ Migración aplicada exitosamente${NC}"
    else
        echo -e "${RED}✗ Archivo no encontrado: migrations/$MIGRATION_FILE${NC}"
        exit 1
    fi
else
    # Aplicar todas las migraciones en orden
    echo -e "${YELLOW}Aplicando todas las migraciones...${NC}"
    for migration in migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo -e "${GREEN}Aplicando: $(basename $migration)${NC}"
            docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$migration"
        fi
    done
    echo -e "${GREEN}✓ Todas las migraciones aplicadas${NC}"
fi

echo ""
echo -e "${GREEN}Índices actuales en tabla songs:${NC}"
docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'songs' ORDER BY indexname;"
