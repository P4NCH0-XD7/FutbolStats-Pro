# FutbolStats Pro

API Node.js/Express con PostgreSQL para consultar la tabla de posiciones.

## Arquitectura

El diagrama de despliegue esta guardado en `arquitectura.png`.

Flujo esperado:

1. Maquina local con Node.js y Docker Compose.
2. GitHub como repositorio remoto.
3. GitHub Actions ejecutando CI con Node 24, PostgreSQL temporal y Jest.
4. Render Web Service ejecutando la API.
5. Render PostgreSQL como base de datos gestionada.

## Errores criticos corregidos

1. La conexion por defecto a PostgreSQL quedaba fija a `localhost`, lo que fallaba dentro del contenedor. Se usa `DATABASE_URL` y Compose apunta a `db_futbol`.
2. El workflow no garantizaba `NODE_ENV=test`. El CI ahora inyecta el entorno de test.
3. La prueba tenia un typo en Jest: `colose`. Se corrigio a la asercion correcta.
4. El Dockerfile usaba una imagen antigua y pesada. Ahora usa `node:24-slim`.
5. El Dockerfile exponia `8080` mientras la app usa `3000`. Ahora expone `3000`.
6. El volumen de PostgreSQL apuntaba a `/data/db`, ruta de MongoDB. Ahora usa `/var/lib/postgresql/data`.
7. Faltaba automatizacion de nube/CI completa. Se agregaron `.github/workflows/ci.yml` y `render.yaml`.

## Ejecucion local

```bash
npm install
npm test
```

## Ejecucion con Docker

Para construir la imagen del backend y levantar la arquitectura completa con PostgreSQL:

```bash
docker compose up --build
```

Este comando crea y ejecuta:

- Contenedor `futbol-backend` con la API Node.js/Express.
- Contenedor `futbol-postgres` con PostgreSQL.
- Red interna de Docker para que la API se conecte a PostgreSQL usando `db_futbol`.
- Volumen `postgres_data` para persistir los datos de la base.

Para ejecutar los contenedores en segundo plano:

```bash
docker compose up --build -d
```

Endpoints:

```bash
GET http://localhost:3000/api/health
GET http://localhost:3000/api/posiciones
```

Para ver los logs:

```bash
docker compose logs -f
```

Para detener los contenedores:

```bash
docker compose down
```

Para detenerlos y borrar tambien el volumen de PostgreSQL:

```bash
docker compose down -v
```

Para reconstruir solo la imagen del backend:

```bash
docker compose build backend
```

## CI

El workflow `.github/workflows/ci.yml` instala dependencias con `npm ci`, levanta PostgreSQL como servicio temporal, configura `NODE_ENV=test` y ejecuta `npm test`.

## Render

El archivo `render.yaml` crea:

- Web Service: `futbol-stats-pro-api`
- PostgreSQL gestionado: `futbol-stats-pro-db`
- Variable `DATABASE_URL` tomada del `connectionString` interno de Render
- `healthCheckPath: /api/health`

En Render, despues de crear el Blueprint, activar deploys con la opcion `After CI check pass`.

## Reparto sugerido para la pareja

Integrante 1:

- Corregir API, conexion a base de datos y pruebas.
- Commit sugerido: `fix: repair api database connection and tests`
- Archivos: `src/app.js`, `src/config/db.js`, `tests/app.test.js`, `package.json`

Integrante 2:

- Corregir Docker, Compose, CI, Render y arquitectura.
- Commit sugerido: `fix: configure docker ci render and architecture`
- Archivos: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.github/workflows/ci.yml`, `render.yaml`, `arquitectura.png`, `.gitignore`, `README.md`

## Guion corto para el video

1. Mostrar `arquitectura.png` y explicar el flujo local -> GitHub -> Actions -> Render.
2. Explicar los 7 errores de la seccion anterior.
3. Mostrar GitHub Actions en verde.
4. Abrir la URL publica de Render en `/api/health`.
5. Abrir la URL publica de Render en `/api/posiciones` y mostrar la tabla de posiciones.
