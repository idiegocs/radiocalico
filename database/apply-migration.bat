@echo off
REM Script para aplicar migraciones en Windows
REM Uso: apply-migration.bat [dev|prod] [archivo_migracion.sql]

setlocal

set ENV=%1
if "%ENV%"=="" set ENV=dev

set MIGRATION_FILE=%2

if "%ENV%"=="prod" (
    set CONTAINER_NAME=radiocalico_db_prod
    set DB_NAME=radiocalico_db_prod
    set DB_USER=radio_user
) else (
    set CONTAINER_NAME=radiocalico_db_dev
    set DB_NAME=radiocalico_db_dev
    set DB_USER=radio_user
)

echo Aplicando migraciones en entorno: %ENV%
echo Container: %CONTAINER_NAME%
echo Database: %DB_NAME%
echo.

if not "%MIGRATION_FILE%"=="" (
    echo Aplicando migracion: %MIGRATION_FILE%
    docker exec -i %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% < migrations\%MIGRATION_FILE%
    if errorlevel 1 (
        echo ERROR: No se pudo aplicar la migracion
        exit /b 1
    )
    echo Migracion aplicada exitosamente
) else (
    echo Aplicando todas las migraciones...
    for %%f in (migrations\*.sql) do (
        echo Aplicando: %%~nxf
        docker exec -i %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% < %%f
    )
    echo Todas las migraciones aplicadas
)

echo.
echo Indices actuales en tabla songs:
docker exec %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'songs' ORDER BY indexname;"

endlocal
