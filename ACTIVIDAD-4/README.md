# CATPRO – Gestión de Catálogo de Productos

Aplicación full-stack sencilla para gestionar un catálogo de productos por usuario, con:

- Autenticación con JWT
- CRUD de productos protegido
- Movimientos de inventario (entradas / salidas) evitando stock negativo
- Pruebas unitarias e integrales con Jest

Este proyecto vive dentro del repositorio:  
https://github.com/Churr000God/Full-Stack/tree/main/ACTIVIDAD-4

---

## Instalación

Desde la raíz del repo clonado (`Full-Stack`), entra en la carpeta del proyecto:

```bash
cd ACTIVIDAD-4
```

Instala dependencias:

```bash
npm install
```

> Nota: no es necesario instalar nada global más allá de Node.js y npm.

---

## Configuración de entorno (`.env`)

En `ACTIVIDAD-4` crea (o edita) un archivo `.env` con al menos:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>/<dbName>?retryWrites=true&w=majority
JWT_SECRET=un_secreto_seguro_aleatorio
```

Recomendaciones:

- Usa MongoDB Atlas para producción y un cluster de prueba para desarrollo.
- No subas nunca el archivo `.env` al repositorio.

---

## Correr en desarrollo

Desde `ACTIVIDAD-4`:

```bash
npm run dev
```

Esto:

- Levanta el servidor Express en el puerto configurado (`PORT`, por defecto `3000`).
- Conecta a la base de datos indicada en `MONGODB_URI`.

Frontend:

- Abre `views/login.html` en un servidor estático (por ejemplo, con la extensión “Live Server” de VS Code).
- Asegúrate de que `API_BASE_URL` en las vistas apunte al backend (por defecto `http://localhost:3000`).

Credenciales de ejemplo:

- Usuario: `dhguilleng@gmail.com`
- Contraseña: `admin123`

> Este usuario se puede crear ejecutando el script `src/createUser.js` o directamente en la base de datos, según se configuró.

---

## Ejecutar pruebas

Desde `ACTIVIDAD-4`:

```bash
npm test
```

La suite incluye:

- **Tests unitarios**:
  - `tests/unit/products.controller.test.js`
  - `tests/unit/user.test.js`
- **Tests de integración**:
  - `tests/integration/app.test.js`
  - `tests/integration/auth.protection.test.js`
  - `tests/integration/products.crud.test.js`

Las pruebas usan:

- `jest` como framework de testing.
- `supertest` para probar la API HTTP.
- `mongodb-memory-server` para levantar una instancia de MongoDB en memoria (no usa tu cluster real).

Todas las pruebas deben pasar antes de desplegar cambios.

---

## Endpoints principales

Base de la API: `http://localhost:3000`

### Auth (`/api/auth`)

- `POST /api/auth/register`
  - Crea un usuario nuevo.
  - Body JSON:
    ```json
    {
      "name": "Juan",
      "email": "juan@example.com",
      "password": "secreto123"
    }
    ```
  - Respuesta: `201 Created` con token JWT.

- `POST /api/auth/login`
  - Autentica un usuario existente.
  - Body JSON:
    ```json
    {
      "email": "juan@example.com",
      "password": "secreto123"
    }
    ```
  - Respuesta: `200 OK` con `token`.

### Productos (`/api/products`)

Todas las rutas de productos requieren header:

```http
Authorization: Bearer <token>
```

- `GET /api/products`
  - Lista productos asociados al usuario autenticado.

- `GET /api/products/:id`
  - Obtiene detalle de un producto concreto.

- `POST /api/products`
  - Crea un producto nuevo.
  - Body JSON típico:
    ```json
    {
      "name": "Teclado",
      "price": 50,
      "stock": 10,
      "description": "Teclado mecánico"
    }
    ```

- `PUT /api/products/:id`
  - Actualiza un producto existente (solo el dueño puede editarlo).

- `DELETE /api/products/:id`
  - Elimina un producto (solo el dueño puede eliminarlo).

### Movimientos de inventario

- `POST /api/products/:id/movements`
  - Registra una entrada o salida de stock para el producto `:id`.
  - Body JSON:
    ```json
    {
      "type": "in",   // "in" para entrada, "out" para salida
      "quantity": 5
    }
    ```
  - Reglas:
    - `quantity` > 0.
    - Para `type = "out"` no se permite dejar el stock en negativo.
    - Solo el dueño del producto puede registrar movimientos.

---

## Notas de despliegue

### Backend

- Asegurar variables de entorno correctas en el servidor:
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
- Usar un servicio tipo **Render**, **Railway** o similar para alojar la API Node.js.
- Configurar *health checks* simples (`GET /api/products` con token válido) para monitorizar disponibilidad.

### Frontend

- Las vistas en `views/` (`login.html`, `admin.html`, `styles.css`) son estáticas.
- Se pueden servir desde:
  - Vercel / Netlify / GitHub Pages.
  - Un bucket S3 / Azure Blob / etc.
- Ajustar `API_BASE_URL` en los scripts de las vistas para apuntar a la URL pública de la API.

### Base de datos

- MongoDB Atlas recomendado:
  - Crear cluster.
  - Configurar usuario y contraseña específicos.
  - Restringir IPs de acceso.
  - Activar backups si es entorno productivo.

---

## Licencia / uso educativo

El proyecto está pensado como práctica de desarrollo full-stack (autenticación, API REST, pruebas y despliegue sencillo).  
Puede adaptarse libremente a otros contextos educativos o extendido para soportar más funcionalidades (roles de usuario, reportes, etc.).

