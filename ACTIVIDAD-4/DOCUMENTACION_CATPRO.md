# CATPRO · Documentación Técnica

## 1. Resumen del proyecto

CATPRO es una aplicación de catálogo de productos con autenticación JWT y gestión de inventario por usuario.  
Permite que cada usuario:

- Se registre e inicie sesión.
- Cree, consulte, actualice y elimine sus propios productos.
- Registre movimientos de inventario (entradas y salidas) sin permitir stock negativo.

El backend está desarrollado con Node.js, Express y MongoDB (Mongoose).  
El frontend es una interfaz sencilla en HTML, CSS y JavaScript puro.

---

## 2. Tecnologías principales

- **Runtime**: Node.js
- **Framework backend**: Express
- **Base de datos**: MongoDB (MongoDB Atlas en producción)
- **ORM/ODM**: Mongoose
- **Autenticación**: JSON Web Tokens (JWT)
- **Testing**: Jest + Supertest + mongodb-memory-server
- **Frontend**: HTML5, CSS3, JavaScript (fetch API)

---

## 3. Estructura de carpetas

Ruta base del proyecto:  
`ACTIVIDAD-4/`

- **src/**
  - **app.js**: Configura la aplicación Express (middlewares, rutas).
  - **server.js**: Arranque del servidor HTTP y conexión a la base de datos.
  - **config/db.js**: Lógica de conexión a MongoDB (Atlas/local).
  - **controllers/**
    - **auth.js**: Controladores de autenticación (register, login).
    - **products.js**: Controladores de productos y movimientos de inventario.
  - **middlewares/**
    - **auth.js**: Middleware de autenticación JWT, protege rutas.
  - **models/**
    - **User.js**: Modelo de usuario (email, password hash, métodos).
    - **Product.js**: Modelo de producto (name, price, stock, createdBy, etc.).
    - **Movement.js**: Modelo de movimiento de inventario (product, user, type, quantity, note).
  - **routes/**
    - **auth.routes.js**: Rutas `/api/auth` (register, login).
    - **product.routes.js**: Rutas `/api/products` (CRUD y `/movements`).
  - **createUser.js**: Script para crear un usuario específico en la BD.
  - **testDb.js**: Script para probar la conexión a la base de datos.

- **views/**
  - **login.html**: Pantalla de inicio de sesión (CATPRO).
  - **admin.html**: Panel de administración y gestión de productos.
  - **styles.css**: Estilos compartidos entre login y admin.

- **tests/**
  - **unit/**
    - **products.controller.test.js**: Tests unitarios del controlador de productos.
    - **user.test.js**: Test unitario de hashing/verificación de contraseñas con bcrypt.
  - **integration/**
    - **app.test.js**: Flujo integrado (auth + productos).
    - **auth.protection.test.js**: Pruebas de protección de rutas.
    - **products.crud.test.js**: Pruebas de CRUD completo de productos.

- **deploy-linux.sh**: Script de despliegue automático en Linux.
- **deploy-windows.ps1**: Script de despliegue automático en Windows.

---

## 4. Modelado de datos (MongoDB)

### 4.1. Usuarios (`User`)

Campos principales:

- `name`: nombre del usuario.
- `email`: correo electrónico (único).
- `passwordHash`: contraseña hasheada con bcrypt.
- Timestamps (`createdAt`, `updatedAt` si se configuró en el schema).

Comportamiento clave:

- Antes de persistir el usuario, la contraseña se guarda como hash.
- Método para validar contraseña (`comparePassword` o similar) usando bcrypt.

### 4.2. Productos (`Product`)

Campos principales:

- `name`: nombre del producto.
- `price`: precio numérico (validación: no negativo).
- `description`: descripción corta u opcional.
- `stock`: cantidad disponible (no negativo).
- `createdBy`: referencia al `User` que creó el producto.

Reglas:

- Un usuario solo puede editar o eliminar productos donde `createdBy` coincida con su ID.
- Validaciones de negocio para evitar precios y stocks inválidos.

### 4.3. Movimientos de inventario (`Movement`)

Campos principales:

- `product`: referencia al `Product`.
- `user`: referencia al `User` que realiza el movimiento.
- `type`: `"in"` o `"out"` (entrada o salida de stock).
- `quantity`: cantidad del movimiento (siempre > 0).
- `note`: texto opcional.
- Timestamps automáticos (`createdAt`, `updatedAt`).

Reglas:

- Para `type = "out"` se valida que `stock - quantity >= 0`.
- Cada movimiento actualiza el `stock` actual del producto.

---

## 5. Flujo de autenticación (JWT)

### 5.1. Registro (`POST /api/auth/register`)

1. El cliente envía `name`, `email`, `password`.
2. El backend:
   - Valida datos mínimos.
   - Hashea la contraseña con bcrypt.
   - Crea el documento de usuario en MongoDB.
   - Genera un JWT que incluye el ID y email del usuario.
3. Respuesta: `201 Created` con el token y datos básicos del usuario.

### 5.2. Login (`POST /api/auth/login`)

1. El cliente envía `email` y `password`.
2. El backend:
   - Busca el usuario por email.
   - Compara la contraseña usando bcrypt.
   - Si es válida, genera un JWT.
3. Respuesta: `200 OK` con `token`.

### 5.3. Middleware de autenticación

Ubicación: `src/middlewares/auth.js`

- Lee el header `Authorization: Bearer <token>`.
- Verifica el token con `JWT_SECRET`.
- Si es válido, coloca en `req.user` datos como `{ id, email }`.
- Si no hay token o es inválido → responde con `401 Unauthorized`.

Este middleware se aplica a todas las rutas protegidas de productos.

---

## 6. CRUD de productos y movimientos

### 6.1. Endpoints de productos

Base: `/api/products`

- **GET `/api/products`**
  - Lista los productos creados por el usuario autenticado (o según la lógica actual).
  - Requiere JWT.

- **GET `/api/products/:id`**
  - Devuelve el detalle de un producto específico.
  - Requiere JWT.

- **POST `/api/products`**
  - Crea un producto nuevo.
  - Cuerpo esperado: `name`, `price`, `stock`, `description` (opcional).
  - Asocia `createdBy` con el usuario autenticado.
  - Validaciones de negocio: precio no negativo, stock no negativo, etc.

- **PUT `/api/products/:id`**
  - Actualiza campos de un producto específico.
  - Solo el usuario que creó el producto puede actualizarlo.
  - Valida que los valores resultantes sigan las reglas (ej. stock no negativo).

- **DELETE `/api/products/:id`**
  - Elimina un producto.
  - Solo el creador puede eliminarlo.

### 6.2. Movimientos de inventario

Rutas adicionales en `product.routes.js`:

- **POST `/api/products/:id/movements`**
  - Registra una entrada o salida de stock para el producto con ID `:id`.
  - Cuerpo:  
    - `type`: `"in"` o `"out"`.  
    - `quantity`: número > 0.  
    - `note` (opcional).
  - Reglas:
    - Solo el dueño del producto puede registrar movimientos.
    - Si `type === "out"` y el stock actual - `quantity` < 0 → `400 Bad Request` (`insufficient_stock`).
    - Si el movimiento es válido, se actualiza el stock y se crea el documento `Movement`.

---

## 7. Frontend (views)

### 7.1. Login (`views/login.html`)

- Formulario con campos:
  - `email`
  - `password`
- Al enviar:
  - Hace `fetch` a `http://localhost:3000/api/auth/login`.
  - Si la respuesta es `200`, guarda `token` en `localStorage`.
  - Redirige a `admin.html`.
  - Si el login falla, muestra mensaje de error al usuario.

### 7.2. Panel de administración (`views/admin.html`)

Funcionalidades:

- Mostrar formulario para crear productos.
- Listar productos en una tabla.
- Botones por producto:
  - `Entrada`: registra entrada de stock.
  - `Salida`: registra salida de stock (previene stock negativo).
  - `Eliminar`: borra el producto.

Lógica:

- Siempre envía el header `Authorization: Bearer <token>` en las peticiones.
- Si no hay token, redirige al login.
- Usa `fetchProducts()` para recargar la tabla después de cualquier operación.

### 7.3. Estilos (`views/styles.css`)

- Tema oscuro consistente para login y panel admin.
- Uso de `flex` y `grid` para layout responsive.
- Botones con degradados y efectos `hover`.
- Tabla estilizada para el listado de productos.

---

## 8. Variables de entorno

Variables recomendadas en `.env`:

- `PORT`  
  - Puerto donde escucha el servidor Express (ej. `3000`).

- `MONGODB_URI` o `DB_URI`  
  - URI de conexión a MongoDB Atlas o instancia local.  
  - Ejemplo (Atlas genérico):  
    `mongodb+srv://<user>:<password>@<cluster>/<dbName>?retryWrites=true&w=majority`

- `JWT_SECRET`  
  - Secreto usado para firmar los tokens JWT.

Estos valores son leídos en `server.js` y `config/db.js`.

---

## 9. Scripts npm y pruebas

### 9.1. Scripts npm (ejemplos típicos)

- `npm run dev`  
  - Arranca el servidor con `nodemon src/server.js` para desarrollo.

- `npm test`  
  - Ejecuta Jest sobre toda la carpeta `tests/`.

Revisar `package.json` para confirmar los nombres exactos de scripts.

### 9.2. Pruebas automatizadas

Framework: **Jest**

Herramientas adicionales:

- **Supertest**: para hacer peticiones HTTP a la app Express en tests de integración.
- **mongodb-memory-server**: ejecuta un MongoDB en memoria para no depender de un servidor externo en pruebas.

Tipos de pruebas:

- **Unitarias**
  - `tests/unit/products.controller.test.js`
    - Verifica que el controlador `create` responde `201` con payload válido.
    - Verifica que responde `400` ante payload inválido (ej. precio negativo).
  - `tests/unit/user.test.js`
    - Confirma que `bcrypt.hash` y `bcrypt.compare` funcionan adecuadamente.

- **Integración**
  - `tests/integration/app.test.js`
    - Prueba flujo de registro, login y creación de producto.
  - `tests/integration/auth.protection.test.js`
    - Verifica que rutas protegidas exigen token y rechazan tokens inválidos.
  - `tests/integration/products.crud.test.js`
    - Valida las reglas de CRUD de productos, incluyendo propiedad del recurso.

Ejecución:

```bash
npm test
```

Debe pasar todo el suite antes de desplegar.

---

## 10. Despliegue

### 10.1. Despliegue en Linux

Archivo: `deploy-linux.sh`

Rol:

- Automatiza:
  - Instalación de dependencias (`npm install`).
  - Configuración mínima.
  - Arranque del servidor (normalmente usando `npm run dev` o un script similar).

Uso típico:

```bash
chmod +x deploy-linux.sh
./deploy-linux.sh
```

> Ajustar el contenido del script para el entorno específico (puerto, gestor de procesos como PM2, etc.).

### 10.2. Despliegue en Windows

Archivo: `deploy-windows.ps1`

Rol:

- Hace tareas equivalentes al script Linux adaptadas a PowerShell:
  - Instalación de dependencias.
  - Arranque del servidor.

Uso típico (en PowerShell):

```powershell
.\deploy-windows.ps1
```

> Es posible que se requiera ajustar la política de ejecución de scripts en PowerShell.

---

## 11. Seguridad y buenas prácticas

- Contraseñas nunca se almacenan en texto plano; solo hashes bcrypt.
- JWT firmado con `JWT_SECRET`, que no debe subirse al repositorio.
- Rutas de productos protegidas por middleware JWT.
- Validaciones en backend:
  - Precio y stock no negativos.
  - Stock nunca se vuelve negativo al aplicar movimientos.
  - Solo el creador de un producto puede editarlo o eliminarlo.
- Frontend:
  - No expone credenciales; solo usa el token almacenado en `localStorage`.

---

## 12. Rollback y recuperación básica

Recomendaciones:

- Antes de desplegar una versión:
  - Crear un tag en Git (ej. `v1.0.0`).
- Para rollback:
  - Volver al tag estable anterior:
    - `git checkout v1.0.0`
    - Redeplegar con los scripts correspondientes.

Base de datos:

- Para entornos de producción, se recomienda:
  - Usar backups de MongoDB Atlas.
  - Tener procedimientos de restauración probados.

---

## 13. Historial funcional (alto nivel)

- **Versión inicial**:
  - Estructura base de Node.js + Express.
  - Modelos `User` y `Product`.
  - Autenticación básica con JWT.
- **Extensión de funcionalidad**:
  - Panel `CATPRO` con login y vista de administración separados.
  - CRUD completo de productos con autorización por dueño.
  - Gestión de movimientos de inventario (entradas/salidas) con control de stock negativo.
- **Calidad y verificación**:
  - Suite de pruebas completas (unitarias + integración) con Jest.
  - Scripts de despliegue para Linux y Windows.

Esta documentación resume el estado actual del proyecto CATPRO y debe mantenerse alineada con futuros cambios de código, modelos y flujos de negocio.

