# Database Migrations

Este directorio contiene las migraciones de la base de datos PostgreSQL para Disc Radio.

## Estructura

```
database/
├── migrations/           # Archivos SQL de migraciones (numerados)
├── apply-migration.sh    # Script para aplicar migraciones (Linux/Mac)
├── apply-migration.bat   # Script para aplicar migraciones (Windows)
└── README.md            # Esta documentación
```

## Migraciones Disponibles

| # | Archivo | Descripción |
|---|---------|-------------|
| 001 | create_songs_table.sql | Crea tabla songs con índices básicos |
| 002 | update_real_songs.sql | Actualiza datos de canciones |
| 003 | add_votes_to_songs.sql | Agrega columna de votos |
| 004 | add_play_count_to_songs.sql | Agrega columna play_count con índice |
| 005 | add_composite_index_play_count_created_at.sql | **NUEVO**: Índice compuesto optimizado |

## Aplicar Migraciones

### Opción 1: Usar Scripts (Recomendado)

**Windows:**
```cmd
cd database
apply-migration.bat dev 005_add_composite_index_play_count_created_at.sql
```

**Linux/Mac:**
```bash
cd database
chmod +x apply-migration.sh
./apply-migration.sh dev 005_add_composite_index_play_count_created_at.sql
```

**Aplicar todas las migraciones:**
```cmd
# Windows
apply-migration.bat dev

# Linux/Mac
./apply-migration.sh dev
```

### Opción 2: Comando Manual (Docker)

**Desarrollo:**
```bash
docker exec -i radiocalico_db_dev psql -U radio_user -d radiocalico_db_dev < database/migrations/005_add_composite_index_play_count_created_at.sql
```

**Producción:**
```bash
docker exec -i radiocalico_db_prod psql -U radio_user -d radiocalico_db_prod < database/migrations/005_add_composite_index_play_count_created_at.sql
```

### Opción 3: Sin Docker (Local)

```bash
psql -U radio_user -d radiocalico_db_dev -f database/migrations/005_add_composite_index_play_count_created_at.sql
```

## Verificar Índices Aplicados

**Ver todos los índices en la tabla songs:**
```bash
# Desarrollo
docker exec radiocalico_db_dev psql -U radio_user -d radiocalico_db_dev -c "\d songs"

# Producción
docker exec radiocalico_db_prod psql -U radio_user -d radiocalico_db_prod -c "\d songs"
```

**Ver solo los índices:**
```bash
docker exec radiocalico_db_dev psql -U radio_user -d radiocalico_db_dev -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'songs' ORDER BY indexname;"
```

## Migración 005: Índice Compuesto

La migración 005 optimiza la consulta principal de canciones que usa:
```sql
ORDER BY play_count DESC NULLS LAST, created_at DESC
```

### Cambios:
- ❌ Elimina: `idx_songs_play_count` (índice simple)
- ✅ Crea: `idx_songs_play_count_created_at` (índice compuesto)

### Beneficio:
- **Antes**: Usa índice + sort adicional (~50-100ms)
- **Después**: Usa solo índice (~5-10ms)
- **Ganancia**: 5-10x más rápido

## Rollback

Si necesitas revertir la migración 005:

```sql
-- Eliminar índice compuesto
DROP INDEX IF EXISTS idx_songs_play_count_created_at;

-- Recrear índice simple original
CREATE INDEX IF NOT EXISTS idx_songs_play_count ON songs(play_count DESC);
```

## Crear Nueva Migración

1. Crear archivo numerado: `00X_descripcion.sql`
2. Usar `IF EXISTS` / `IF NOT EXISTS` para idempotencia
3. Agregar comentarios descriptivos
4. Probar en desarrollo primero
5. Aplicar en producción

## Notas

- Las migraciones son **idempotentes** (puedes ejecutarlas múltiples veces)
- Siempre probar en desarrollo antes de producción
- Los scripts verifican que Docker esté corriendo
- Usar `IF EXISTS` / `IF NOT EXISTS` para evitar errores
