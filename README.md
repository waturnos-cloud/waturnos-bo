# 🚀 WATurnos BACK OFFICE WEB (React + TypeScript + Material UI)

Front-end oficial del ecosistema de back office **WATurnos**, integrado con los servicios de autenticación, clientes, proveedores, organizaciones y turnos.  
Implementado con **React + Vite**, **Material UI**, **React Router**, **Axios con JWT**, y soporte para mapa interactivo con **Leaflet**.

---


# 📦 Requisitos

- **Node.js 18+**
- **pnpm** (recomendado)

---

# 🛠️ Instalación y ejecución

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Abrir: http://localhost:5173

---

# 📂 Estructura del proyecto

```
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx           # Punto de entrada Vite
    ├── App.tsx            # Router principal
    ├── api/               # Axios + módulos de API
    ├── auth/              # JWT, AuthContext, ProtectedRoute
    ├── components/        # UI reutilizable
    ├── layout/            # Layout global
    ├── pages/             # Vistas principales
    ├── types/             # DTOs y definiciones TS
    ├── utils/             # Helpers generales
    ├── theme/             # Material UI Theme
    └── config/            # Helpers o constantes
```

---

# 🔐 Autenticación JWT

- Login → `POST /auth/login`
- Token se guarda en:
  ```
  localStorage.jwtToken
  ```
- Axios agrega automáticamente:
  ```
  Authorization: Bearer <token>
  ```

---

# 🧭 Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/` | Dashboard general |
| `/clients` | Gestión de clientes |
| `/bookings` | Turnos |
| `/dashboard-organizations` | Organizaciones |
| `/dashboard-providers` | Proveedores |


---

# 🌍 Mapa (Leaflet)

En creación de organización:

- Click en el mapa mueve el pin  
- Pin draggable  
- Coordenadas actualizadas en el formulario  

---

# 🧪 Scripts

```
pnpm dev
pnpm build
pnpm preview
pnpm lint
```

---

# 🗂️ .gitignore

Incluye node_modules, dist, logs, env, VSCode, .DS_Store, etc.

---

# 👥 Contribución

1. `git checkout -b feature/nombre`
2. `git commit -m "Mensaje"`
3. `git push origin feature/nombre`
4. Crear Pull Request

---

# 🧩 Roadmap

- Dashboard proveedor mejorado  
- Agenda día/semana  
- Agenda pública  
- Notificaciones  
- Pasarela de pagos  

---

🔥 **Listo para usar e iterar.** 🔥
