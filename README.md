
# WATurnos Web (React + Material UI)

Front-end base alineado con los controladores actuales de *Clients* y *Bookings*,
usando Material UI y axios con JWT.

## Requisitos
- Node 18+
- pnpm (recomendado) o npm/yarn

## Instalación
```bash
pnpm install
cp .env.example .env
# editar .env si hace falta
pnpm dev
```

Abrí http://localhost:5173

## Estructura
- `src/api`: Módulos axios: auth, clients, bookings.
- `src/auth`: Contexto de auth (JWT) + ruta protegida.
- `src/components`: UI reutilizable (AppBar, diálogos).
- `src/pages`: Login, Dashboard, Clients, Bookings.
- `src/types`: DTOs y enums mínimos para compilar.
- `src/theme`: Tema Material UI base (colores WATurnos).

## Rutas
- `/login`
- `/` (Dashboard)
- `/clients`
- `/bookings`

## JWT
- El token devuelto por `POST /auth/login` se guarda en `localStorage.jwtToken`.
- El interceptor axios adjunta `Authorization: Bearer <token>`.

## Notas
- Selector de servicio en BookingsPage está "mockeado" con `value=1` y un MenuItem.
  Conectar a tus endpoints reales de servicios para poblarlo.
- El diálogo de *Asignar turno* crea `BookingDTO` y lo envía a `POST /bookings` (lista).
- Cancelar turno usa `POST /bookings/cancel` con `{ id, reason }`.

¡Listo para iterar! 
