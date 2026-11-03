# Servidor Backend Eureka (VPS propio)

API Node.js/Express que se conecta al PostgreSQL **dedicado de Eureka** (contenedor `eureka-db`, volumen `eureka_pgdata`) en tu VPS. No depende de Vercel ni de Supabase.

## Despliegue actual
- Frontend: nginx sirve `/var/www/eureka` en `https://eureka.89.117.73.97.sslip.io` (Let's Encrypt, renovación automática).
- API: contenedor `eureka_api` en `/opt/eureka` (puerto 3050, nginx hace proxy de `/api/` y `/health`).
- Base de datos: contenedor `eureka-db`, solo accesible desde el propio VPS (`127.0.0.1:5434`).
- Backups: `/usr/local/bin/eureka-backup` → `/var/backups/eureka/hourly` (cada hora, 3 días) y `/daily` (03:40, 30 días); `/manual` no se borra solo. Incluyen también el JSON de respaldo de la API.
- Protección de datos del servidor: una fila defectuosa no apaga Postgres ni aborta el resto; los UPDATE solo se aplican si la fila es del mismo usuario (los mazos de demostración comparten IDs entre invitados); los ajustes se fusionan sobre lo que ya hay en Postgres; y lo que quede solo en `data/eureka_store.json` se reconcilia con Postgres al arrancar, al recuperarse la conexión y cada 30 min (`/health` → `lastReconcile`).
- Credenciales: `/opt/eureka/.env` (chmod 600, fuera de git). Plantilla en `.env.example`.

## Garantías de datos (cuentas separadas, nada se pierde)
- Mazos y tarjetas se identifican por **(user_id, id)** (`migrations/002-composite-keys.sql`): cada cuenta tiene su propio espacio de IDs, así los mazos de demostración de dos cuentas no chocan.
- **Red de seguridad en la propia base** (`migrations/003-safety-net.sql`, triggers): cada cambio de contenido en los ajustes/cuadernos guarda la versión anterior en `eureka_settings_history` (≤1 por minuto, 40 por usuario) y todo mazo/tarjeta borrado se copia a `eureka_trash` (90 días). Para recuperar: `select * from eureka_trash where user_id='…' order by deleted_at desc;`
- `POST /api/ids/foreign` dice al cliente qué elementos sin confirmar son de otra cuenta, para apartarlos en lugar de mezclarlos.
- Las respuestas de `/api/decks/sync` y `/api/cards/sync` incluyen `failedIds`: el cliente solo da por guardado lo que el servidor realmente guardó.

## Crear la base de datos desde cero (solo si hiciera falta)
```bash
docker volume create eureka_pgdata
docker run -d --name eureka-db --restart always \
  -e POSTGRES_USER=eureka -e POSTGRES_DB=eureka -e POSTGRES_PASSWORD='<la de .env>' \
  -v eureka_pgdata:/var/lib/postgresql/data -p 127.0.0.1:5434:5432 postgres:16-alpine
```
Las tablas (`eureka_users`, `eureka_decks`, `eureka_flashcards`, `eureka_study_logs`, `eureka_user_settings`) se restauran desde un backup `.dump`.

## Desplegar cambios (desde la raíz del repo)
```bash
npm run deploy:vps            # frontend + API
npm run deploy:vps -- web     # solo frontend
npm run deploy:vps -- api     # solo server/server.js
```

## Restaurar un backup
```bash
docker exec -i eureka-db pg_restore -U eureka -d eureka --clean --if-exists --no-owner < /var/backups/eureka/eureka-AAAAMMDD-HHMMSS.dump
```

## Endpoints Disponibles
- `GET /health` -> Comprobación de estado y hora del servidor
- `POST /api/auth/register` -> Registro de usuarios
- `POST /api/auth/login` -> Inicio de sesión
- `POST /api/auth/logout` -> Cierre de sesión
- `GET /api/decks?userId=...` -> Listado de carpetas y mazos
- `POST /api/decks/sync` -> Sincronización masiva de mazos
- `DELETE /api/decks/:id` -> Eliminación de un mazo y sus tarjetas
- `POST /api/decks/batch-delete` -> Eliminación en lote de mazos
- `GET /api/cards?userId=...` -> Listado de flashcards del usuario
- `POST /api/cards/sync` -> Sincronización masiva de flashcards
- `DELETE /api/cards/:id` -> Eliminación de tarjeta
- `POST /api/cards/batch-delete` -> Eliminación en lote de tarjetas
- `GET /api/settings?userId=...` -> Obtener preferencias/temas/guías del usuario
- `POST /api/settings` -> Guardar preferencias/temas/guías del usuario
- `POST /api/study-logs` -> Registro de estadísticas y analíticas de repasos
- `POST /api/profile` -> Actualización de perfil, XP y racha
