# Guía de Configuración de Datadog

Esta guía te ayudará a configurar Datadog para monitorear logs de tu aplicación paso a paso.

## ¿Qué es Datadog?

Datadog es una plataforma de monitoreo que te permite ver todos los logs (registros) de tu aplicación en un solo lugar, en tiempo real, desde cualquier navegador.

## Paso 1: Obtener tu API Key de Datadog

1. Ve a https://app.datadoghq.com (o https://datadoghq.eu si estás en Europa)
2. Inicia sesión con tu cuenta de Datadog (o crea una cuenta gratuita)
3. Haz clic en tu nombre de usuario en la esquina inferior izquierda
4. Selecciona "Organization Settings"
5. En el menú lateral, haz clic en "API Keys"
6. Copia tu API Key (es una cadena larga de letras y números como: `1234567890abcdef1234567890abcdef`)

## Paso 2: Configurar la API Key en tu proyecto

### Para Entorno de Desarrollo:

1. Abre el archivo: `env/.env.development`
2. Busca la línea que dice:
   ```
   DD_API_KEY=your_datadog_api_key_here
   ```
3. Reemplaza `your_datadog_api_key_here` con tu API Key real:
   ```
   DD_API_KEY=1234567890abcdef1234567890abcdef
   ```

### Para Entorno de Producción:

1. Abre el archivo: `env/.env.production`
2. Busca la línea que dice:
   ```
   DD_API_KEY=your_datadog_api_key_here
   ```
3. Reemplaza `your_datadog_api_key_here` con tu API Key real

## Paso 3: (Opcional) Configurar el Site de Datadog

Si tu cuenta de Datadog NO está en Estados Unidos (US1), actualiza el valor de `DD_SITE`:

```bash
# Para Europa
DD_SITE=datadoghq.eu

# Para US3
DD_SITE=us3.datadoghq.com

# Para US5
DD_SITE=us5.datadoghq.com

# Para Asia-Pacífico
DD_SITE=ap1.datadoghq.com
```

**Nota:** Si no estás seguro, déjalo como está (`datadoghq.com`). La mayoría de usuarios usa este valor.

## Paso 4: Iniciar la aplicación

Una vez configurada la API Key, inicia tu aplicación:

```bash
# Detener contenedores actuales (si están corriendo)
npm run docker:down

# Iniciar en modo desarrollo
npm run docker:dev
```

## Paso 5: Verificar que Datadog está funcionando

### Verificar que el contenedor está corriendo:

```bash
docker ps | grep datadog
```

Deberías ver una línea con `radiocalico_datadog_dev`.

### Ver logs del agente de Datadog:

```bash
docker logs radiocalico_datadog_dev
```

Si todo está bien, verás mensajes como:
- "Datadog Agent is running"
- "Logs Agent is running"

Si hay problemas, verás mensajes de error sobre la API Key.

## Paso 6: Ver tus logs en Datadog

1. Ve a https://app.datadoghq.com/logs (o tu sitio correspondiente)
2. Espera 1-2 minutos para que aparezcan los primeros logs
3. Deberías ver logs de:
   - `radiocalico-app` (tu aplicación Node.js)
   - `radiocalico-db` (PostgreSQL)
   - `radiocalico-adminer` (solo en desarrollo)

### Filtrar logs:

En la barra de búsqueda de Datadog, puedes usar:

```
service:radiocalico-app env:development
```

Esto mostrará solo los logs de tu aplicación en desarrollo.

## Problemas Comunes

### El contenedor de Datadog se reinicia constantemente

**Causa:** API Key inválida o incorrecta

**Solución:**
1. Verifica que copiaste la API Key completa (sin espacios)
2. Verifica que el archivo `env/.env.development` se guardó correctamente
3. Reinicia los contenedores:
   ```bash
   npm run docker:down
   npm run docker:dev
   ```

### No veo logs en Datadog

**Solución 1 - Espera un poco:**
Los logs pueden tardar 1-2 minutos en aparecer la primera vez.

**Solución 2 - Verifica el agente:**
```bash
docker logs radiocalico_datadog_dev
```

Busca líneas que digan "API Key" o "authentication" para ver si hay problemas.

**Solución 3 - Verifica el site:**
Asegúrate de que `DD_SITE` en tu archivo `.env.development` coincide con tu cuenta de Datadog.

### Error "Cannot connect to Docker socket"

**Causa:** Docker Desktop no está corriendo o no tiene permisos

**Solución:**
1. Asegúrate de que Docker Desktop está corriendo
2. En Windows, Docker Desktop debe tener acceso al socket de Docker

## Comandos Útiles

```bash
# Ver logs del agente de Datadog
docker logs radiocalico_datadog_dev

# Ver logs en tiempo real
docker logs -f radiocalico_datadog_dev

# Reiniciar solo el contenedor de Datadog
docker restart radiocalico_datadog_dev

# Ver todos los contenedores corriendo
docker ps
```

## Desactivar Datadog Temporalmente

Si necesitas desactivar Datadog temporalmente:

1. Edita `env/.env.development`
2. Cambia:
   ```
   DD_LOGS_ENABLED=false
   ```
3. Reinicia los contenedores:
   ```bash
   npm run docker:down
   npm run docker:dev
   ```

## Archivos Modificados

Los siguientes archivos fueron configurados para Datadog:

- `env/.env.development` - Variables de entorno para desarrollo
- `env/.env.production` - Variables de entorno para producción
- `docker/docker-compose.yml` - Configuración base del agente Datadog
- `docker/docker-compose.dev.yml` - Configuración de desarrollo
- `docker/docker-compose.prod.yml` - Configuración de producción
- `CLAUDE.md` - Documentación del proyecto actualizada

## Soporte

Para más información sobre Datadog:
- Documentación oficial: https://docs.datadoghq.com/
- Ayuda con logs: https://docs.datadoghq.com/logs/
- Documentación del agente: https://docs.datadoghq.com/agent/
