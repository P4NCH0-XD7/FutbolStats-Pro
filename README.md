# FutbolStats Pro

API Node.js/Express con PostgreSQL para consultar una tabla de posiciones de futbol. El proyecto incluye contenedorizacion local, pruebas automatizadas con Jest, pipeline de CI en GitHub Actions y Blueprint de Render para desplegar la API junto con una base de datos PostgreSQL gestionada.

## Arquitectura

El diagrama de despliegue esta disponible en la raiz del repositorio:

```text
arquitectura.png
```

Flujo de despliegue:

```text
Maquina local -> GitHub -> GitHub Actions CI -> Render Web Service + Render PostgreSQL
```

## Requisitos para ejecucion local

Para ejecutar la arquitectura completa localmente solo se requiere:

- Docker Desktop
- Git

No es necesario instalar PostgreSQL localmente. Docker Compose levanta el contenedor de PostgreSQL.

No es necesario ejecutar `npm install` para correr la API con Docker. El `Dockerfile` instala las dependencias dentro de la imagen usando:

```dockerfile
RUN npm ci --omit=dev
```

## Ejecutar con Docker Compose

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd futbol-stats-pro
```

Construir la imagen y levantar API + PostgreSQL:

```bash
docker compose up --build
```

Tambien puede ejecutarse en segundo plano:

```bash
docker compose up --build -d
```

El comando anterior crea:

- `futbol-backend`: contenedor de la API Node.js/Express.
- `futbol-postgres`: contenedor de PostgreSQL.
- `postgres_data`: volumen persistente para la base de datos.
- Red interna de Compose para que la API use `db_futbol` como host de PostgreSQL.

## Probar la API

Health check:

```text
http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "UP",
  "database": "CONNECTED"
}
```

Tabla de posiciones:

```text
http://localhost:3000/api/posiciones
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "nombre": "ITP F.C.",
    "puntos": 9,
    "diferencia_goles": 5
  }
]
```

## Comandos utiles de Docker

Ver logs:

```bash
docker compose logs -f
```

Detener contenedores:

```bash
docker compose down
```

Detener contenedores y borrar el volumen de PostgreSQL:

```bash
docker compose down -v
```

Reconstruir solo la imagen del backend:

```bash
docker compose build backend
```

## Ejecutar pruebas

Para ejecutar las pruebas desde la maquina local si se requiere instalar las dependencias de desarrollo, porque Jest y Supertest no se instalan dentro de la imagen de produccion:

```bash
npm install
```

Con Docker Compose corriendo, configurar variables de entorno y ejecutar Jest.

En PowerShell:

```powershell
$env:NODE_ENV="test"
$env:DATABASE_URL="postgresql://postgres:password123@localhost:5432/futbol_db"
npm.cmd test
```

En Bash:

```bash
NODE_ENV=test DATABASE_URL=postgresql://postgres:password123@localhost:5432/futbol_db npm test
```

## CI con GitHub Actions

El workflow esta en:

```text
.github/workflows/ci.yml
```

El pipeline:

1. Usa Node.js 24.
2. Instala dependencias con `npm ci`.
3. Levanta PostgreSQL temporal como servicio de GitHub Actions.
4. Inyecta `NODE_ENV=test`.
5. Inyecta `DATABASE_URL`.
6. Ejecuta `npm test`.

## Despliegue en Render

El Blueprint esta en:

```text
render.yaml
```

El archivo crea:

- Web Service: `futbol-stats-pro-api`
- PostgreSQL gestionado: `futbol-stats-pro-db`
- Variable `DATABASE_URL` tomada automaticamente del `connectionString` de Render PostgreSQL
- `healthCheckPath` apuntando a `/api/health`

Despues de crear el Blueprint en Render, activar la opcion:

```text
After CI check pass
```

## Errores criticos corregidos

1. La API usaba `localhost` para conectarse a PostgreSQL dentro del contenedor. Se corrigio usando `DATABASE_URL` y el host interno `db_futbol` en Compose.
2. El entorno de pruebas no estaba garantizado en CI. Se agrego `NODE_ENV=test` en GitHub Actions.
3. La prueba tenia un typo en la asercion de Jest: `colose`. Se corrigio la asercion.
4. El Dockerfile usaba una imagen antigua y pesada. Se actualizo a `node:24-slim`.
5. El Dockerfile exponia el puerto incorrecto. Se corrigio a `3000`.
6. El volumen de PostgreSQL apuntaba a `/data/db`, ruta propia de MongoDB. Se corrigio a `/var/lib/postgresql/data`.
7. Faltaba automatizacion de CI y nube. Se agregaron `.github/workflows/ci.yml` y `render.yaml`.