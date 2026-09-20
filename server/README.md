# Servidor Backend Eureka (VPS Propio)

Este servidor Node.js/Express reemplaza completamente a Supabase y se conecta directamente a la base de datos PostgreSQL de tu VPS.

## Credenciales y Variables de Entorno
Por defecto toma la base de datos de tu VPS:
- **Host**: `89.117.73.97`
- **Puerto PostgreSQL**: `5432`
- **Base de Datos**: `postgres`
- **Cadena de conexión**: `postgresql://postgres:vfZlTfp1qCDnVlngOb4FDDJsNKqUgKJb@89.117.73.97:5432/postgres`

## Cómo ejecutar en el VPS

### Opción A: Con PM2 (Recomendada)
```bash
cd server
npm install
pm2 start server.js --name "eureka-api"
pm2 save
```

### Opción B: En segundo plano con Node / Systemd
```bash
cd server
npm install
npm start
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
