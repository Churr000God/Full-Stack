# Documentación del Proyecto Gestor de Tareas (Full Stack)

Este documento detalla el funcionamiento del proyecto, explicando el código sección por sección y línea por línea, además de instrucciones para su instalación y ejecución.

## Tabla de Contenidos
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Instrucciones de Inicialización](#instrucciones-de-inicialización)
   - [Windows (Automático)](#windows-automático)
   - [Linux/Mac (Automático)](#linuxmac-automático)
   - [Manual](#manual)
3. [Explicación Detallada del Código (Backend)](#explicación-detallada-del-código-backend)
4. [Explicación Detallada del Código (Frontend)](#explicación-detallada-del-código-frontend)

---

## Estructura del Proyecto

```
ACTIVIDAD-2/
├── BACKEND/
│   ├── server.js          # Servidor Express principal
│   ├── package.json       # Dependencias de Node.js
│   ├── tareas.json        # Base de datos local de tareas
│   └── usuarios.json      # Base de datos local de usuarios
├── FRONTEND/
│   ├── index.html         # Interfaz de usuario
│   ├── CSS/style.css      # Estilos visuales
│   └── JS/app.js          # Lógica del cliente (Fetch API)
├── setup.ps1              # Script de instalación para Windows
├── setup.sh               # Script de instalación para Linux/Mac
└── README.md              # Este archivo
```

---

## Instrucciones de Inicialización

Hemos creado scripts automáticos para facilitar la instalación de dependencias y el inicio del servidor.

### Windows (Automático)
1. Abre una terminal (PowerShell).
2. Navega a la carpeta raíz del proyecto.
3. Ejecuta el script:
   ```powershell
   .\setup.ps1
   ```
   *Este script instalará las dependencias en `BACKEND` y arrancará el servidor.*

### Linux/Mac (Automático)
1. Abre una terminal.
2. Navega a la carpeta raíz.
3. Da permisos de ejecución y corre el script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

### Manual
Si prefieres hacerlo paso a paso:
1. Ve a la carpeta `BACKEND`: `cd BACKEND`
2. Instala dependencias: `npm install`
3. Inicia el servidor: `node server.js`
4. Abre `FRONTEND/index.html` en tu navegador.

---

## Explicación Detallada del Código (Backend)

Archivo: `BACKEND/server.js`

### 1. Importaciones y Configuración
```javascript
const express = require('express');      // Framework web para Node.js
const bodyParser = require('body-parser'); // Middleware para parsear bodies (aunque express.json lo reemplaza)
const fs = require('fs').promises;       // Sistema de archivos con promesas (async/await)
const path = require('path');            // Manejo de rutas de archivos
const bcrypt = require('bcryptjs');      // Librería para encriptar contraseñas
const jwt = require('jsonwebtoken');     // Librería para generar tokens JWT
const cors = require('cors');            // Middleware para permitir peticiones desde el frontend
```

### 2. Middlewares de Seguridad y Lógica
#### Middleware de Autenticación (`verificarToken`)
Este código protege las rutas privadas.
```javascript
const verificarToken = (req, res, next) => {
    // 1. Obtiene el header 'Authorization' de la petición
    const authHeader = req.headers['authorization'];
    // 2. Extrae el token (formato "Bearer <token>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Si no hay token, deniega el acceso (401)
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
        // 4. Verifica que el token sea válido usando la clave secreta
        const verificado = jwt.verify(token, SECRET_KEY);
        // 5. Si es válido, guarda los datos del usuario en la request
        req.usuario = verificado;
        // 6. Pasa al siguiente middleware o ruta
        next();
    } catch (error) {
        // 7. Si falla la verificación, devuelve error 401
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};
```

#### Middleware de Validación (`validarTarea`)
Asegura que los datos recibidos sean correctos.
```javascript
const validarTarea = (req, res, next) => {
    const { nombre } = req.body;
    
    // Si intentan CREAR (POST), el nombre es obligatorio
    if (req.method === 'POST') {
        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: 'Título obligatorio' });
        }
    }
    next(); // Si pasa la validación, continúa
};
```

### 3. Rutas (Endpoints)
- **POST /login**: Recibe usuario/pass, verifica con `bcrypt`, y si es correcto devuelve un `token` JWT.
- **GET /tareas**: (Protegido) Lee `tareas.json` y devuelve la lista.
- **POST /tareas**: (Protegido) Recibe un JSON, valida datos, agrega al array y guarda en disco.

---

## Explicación Detallada del Código (Frontend)

Archivo: `FRONTEND/JS/app.js`

### 1. Autenticación y JWT
La clase `GestorDeTareas` maneja el token JWT.

```javascript
// Método para obtener headers con el token automáticamente
getHeaders() {
    return {
        'Content-Type': 'application/json',
        // Inyecta el token en cada petición para que el backend nos reconozca
        'Authorization': `Bearer ${this.token}`
    };
}

// Carga de tareas desde el servidor
async cargarTareasAPI() {
    try {
        // Hace petición GET a localhost:3000/tareas
        const response = await fetch('http://localhost:3000/tareas', {
            headers: this.getHeaders() // Usa los headers con token
        });
        
        // Si el token expiró (401), cierra sesión automáticamente
        if (response.status === 401) {
            this.cerrarSesion();
            return;
        }
        
        // Convierte respuesta a JSON y actualiza la lista local
        const data = await response.json();
        this.tareas = data.map(obj => Tarea.fromJson(obj));
        this.render(); // Dibuja la tabla HTML
    } catch (error) {
        console.error('Error cargando tareas:', error);
    }
}
```

### 2. Debugging
Se han añadido logs en el servidor para rastrear eventos:
- `[DEBUG] Login correcto...`: Cuando un usuario entra.
- `[DEBUG] Tarea creada...`: Cuando se guarda un dato.
- `[DEBUG] Error...`: Para fallos de lectura/escritura.

Esto permite monitorear la aplicación en tiempo real usando `node --inspect`.
