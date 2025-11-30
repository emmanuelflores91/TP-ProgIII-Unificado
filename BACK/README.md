# Medieval Shop - Backend (API + Admin)

API REST para tienda medieval + Panel de administración.

## Instalación

```bash
npm install
```

## Configuración

Crear `.env`:

```
PORT=3010
FRONTEND_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3308
DB_NAME=digital_dragon
DB_USER=emma
DB_PASSWORD=1234
```

## Desarrollo

```bash
npm run dev  # Abre en http://localhost:3010
```

## Estructura

```
src/api/
├── controllers/       - Lógica CRUD
├── models/            - Consultas BD
├── routes/            - Endpoints
└── middlewares/       - Validaciones
src/views/             - Plantillas EJS admin
public/
├── css/admin.css      - Estilos panel admin
└── img/productos/     - Imágenes
```

## Rutas

### API (JSON para Cliente)

```
GET    /api/productos        - Lista todos
GET    /api/productos/:id    - Obtiene uno
POST   /api/productos        - Crear
PUT    /api/productos/:id    - Actualizar
DELETE /api/productos/:id    - Eliminar
POST   /api/productos/ticket - Generar ticket
```

### Admin (EJS Server-Side)

```
GET /admin              - Panel de administración
GET /admin/crear        - Formulario crear
GET /admin/:id/editar   - Formulario editar
```

## CORS

Configurado para aceptar solicitudes desde `http://localhost:5173`

## Notas

- Base de datos: MySQL en puerto 3308 (XAMPP)
- Panel admin: Sin autenticación (TODO: Implementar)
- Imágenes: Se guardan en `public/img/productos/`