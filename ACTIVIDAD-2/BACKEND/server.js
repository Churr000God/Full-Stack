// Importamos el framework Express para crear el servidor y manejar rutas
const express = require('express');
// Importamos body-parser para procesar datos del cuerpo de las peticiones (aunque express.json() lo sustituye en versiones modernas)
const bodyParser = require('body-parser');
// Importamos el módulo 'fs' (File System) usando promesas para leer/escribir archivos de forma asíncrona
const fs = require('fs').promises; 
// Importamos 'path' para manejar rutas de archivos y directorios de forma compatible con cualquier sistema operativo
const path = require('path');
// Importamos bcryptjs para encriptar y comparar contraseñas de forma segura
const bcrypt = require('bcryptjs');
// Importamos jsonwebtoken para generar y verificar tokens de autenticación (JWT)
const jwt = require('jsonwebtoken');
// Importamos cors para permitir que el frontend (otro dominio/puerto) haga peticiones a este backend
const cors = require('cors'); 

// Inicializamos la aplicación de Express
const app = express();
// Definimos el puerto donde correrá el servidor
const PORT = 3000;
// Definimos la clave secreta para firmar los tokens JWT (¡En producción esto debe ir en variables de entorno!)
const SECRET_KEY = 'mi_secreto_super_seguro'; 

// --- MIDDLEWARES GLOBALES ---
// Habilitamos CORS para que cualquier origen pueda conectarse (útil para desarrollo)
app.use(cors()); 
// Habilitamos el middleware para entender JSON en el cuerpo de las peticiones (req.body)
app.use(express.json());

// --- CONSTANTES DE ARCHIVOS ---
// Definimos la ruta absoluta al archivo tareas.json usando path.join para evitar errores de rutas
const TAREAS_FILE = path.join(__dirname, 'tareas.json');
// Definimos la ruta absoluta al archivo usuarios.json
const USUARIOS_FILE = path.join(__dirname, 'usuarios.json');

// --- FUNCIONES HELPER (AYUDA) ---
// Función asíncrona para leer datos de un archivo JSON
const leerDatos = async (filePath) => {
    try {
        // Intentamos leer el archivo con codificación utf8
        const data = await fs.readFile(filePath, 'utf8');
        // Convertimos el texto JSON a un objeto/array de JavaScript
        return JSON.parse(data);
    } catch (error) {
        // Si el error es que el archivo no existe (ENOENT), retornamos un array vacío
        if (error.code === 'ENOENT') return [];
        // Si es otro error, lo mostramos en consola
        console.error(`Error leyendo ${filePath}:`, error);
        console.log(`[DEBUG] Error leyendo archivo ${filePath}`);
        // Retornamos array vacío por seguridad
        return [];
    }
};

// Función asíncrona para escribir datos en un archivo JSON
const escribirDatos = async (filePath, datos) => {
    try {
        // Escribimos el objeto convertido a texto JSON con indentación de 2 espacios
        await fs.writeFile(filePath, JSON.stringify(datos, null, 2));
        // Retornamos true indicando éxito
        return true;
    } catch (error) {
        // Si falla, mostramos el error
        console.error(`Error escribiendo en ${filePath}:`, error);
        console.log(`[DEBUG] Error escribiendo archivo ${filePath}`);
        // Retornamos false indicando fallo
        return false;
    }
};

// --- MIDDLEWARES PERSONALIZADOS ---

// Middleware para verificar si el usuario tiene un token válido
const verificarToken = (req, res, next) => {
    // Obtenemos el encabezado 'Authorization' de la petición
    const authHeader = req.headers['authorization'];
    // Extraemos el token separando "Bearer <token>" (tomamos la segunda parte)
    const token = authHeader && authHeader.split(' ')[1];

    // Si no hay token, respondemos con error 401 (No autorizado)
    if (!token) {
        console.log('[DEBUG] Acceso denegado: Token no proporcionado');
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
        // Verificamos si el token es válido usando nuestra clave secreta
        const verificado = jwt.verify(token, SECRET_KEY);
        // Si es válido, guardamos los datos del usuario decodificados en el objeto req
        req.usuario = verificado; 
        // Llamamos a next() para pasar a la siguiente función/ruta
        next(); 
    } catch (error) {
        // Si el token es falso o expiró, respondemos con error 401
        console.log('[DEBUG] Token inválido o expirado');
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware para validar los datos de una tarea antes de procesarla
const validarTarea = (req, res, next) => {
    // Extraemos el nombre del cuerpo de la petición
    const { nombre } = req.body;
    
    // Validación para el método POST (Crear)
    if (req.method === 'POST') {
        // Verificamos que el nombre exista, sea string y no esté vacío
        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: 'Solicitud incorrecta: El título (nombre) de la tarea es obligatorio' });
        }
    }

    // Validación para el método PUT (Actualizar)
    if (req.method === 'PUT' && nombre !== undefined) {
        // Si envían nombre, verificamos que no esté vacío
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: 'Solicitud incorrecta: El título (nombre) no puede estar vacío' });
        }
    }
    
    // Si todo está bien, pasamos al siguiente paso
    next();
};

// --- RUTAS PÚBLICAS ---
// Ruta raíz para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// --- RUTAS DE TAREAS (PROTEGIDAS) ---

// Obtener todas las tareas (GET)
// Usa middleware verificarToken: solo usuarios logueados pueden ver tareas
app.get('/tareas', verificarToken, async (req, res) => {
    // Leemos las tareas del archivo
    const tareas = await leerDatos(TAREAS_FILE);
    // Respondemos con el JSON de tareas
    res.json(tareas);
});

// Crear una nueva tarea (POST)
// Usa verificarToken (auth) y validarTarea (datos correctos)
app.post('/tareas', verificarToken, validarTarea, async (req, res) => {
    const { nombre } = req.body;
    
    // Leemos las tareas actuales
    const tareas = await leerDatos(TAREAS_FILE);
    
    // Creamos el objeto de la nueva tarea
    const nuevaTarea = {
        id: Date.now().toString(), // Generamos ID único con la fecha actual
        nombre: nombre,            // Asignamos el nombre recibido
        completa: false,           // Por defecto no está completa
        creadaEn: Date.now()       // Guardamos fecha de creación
    };

    // Agregamos la nueva tarea al array
    tareas.push(nuevaTarea);
    
    // Guardamos el array actualizado en el archivo
    const guardado = await escribirDatos(TAREAS_FILE, tareas);
    
    // Si se guardó bien, respondemos con la tarea creada (201 Created)
    if (guardado) {
        console.log(`[DEBUG] Tarea creada: ${nombre}`);
        res.status(201).json(nuevaTarea);
    } else {
        // Si falló el guardado, error 500
        console.log('[DEBUG] Error al guardar tarea');
        res.status(500).json({ error: 'Error al guardar la tarea' });
    }
});

// Actualizar una tarea existente (PUT)
app.put('/tareas/:id', verificarToken, validarTarea, async (req, res) => {
    // Obtenemos el ID de la URL
    const { id } = req.params;
    // Obtenemos los datos a actualizar del cuerpo
    const { nombre, completa } = req.body;

    // Leemos tareas
    const tareas = await leerDatos(TAREAS_FILE);
    // Buscamos el índice de la tarea con ese ID
    const index = tareas.findIndex(t => t.id === id);

    // Si no existe (index -1), error 404
    if (index === -1) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Creamos objeto actualizado manteniendo datos viejos si no se enviaron nuevos
    const tareaActualizada = {
        ...tareas[index], // Copiamos propiedades actuales
        nombre: nombre !== undefined ? nombre : tareas[index].nombre, // Actualizamos nombre si existe
        completa: completa !== undefined ? completa : tareas[index].completa // Actualizamos estado si existe
    };

    // Reemplazamos la tarea en el array
    tareas[index] = tareaActualizada;

    // Guardamos cambios
    const guardado = await escribirDatos(TAREAS_FILE, tareas);

    if (guardado) {
        res.json(tareaActualizada);
    } else {
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

// Eliminar una tarea (DELETE)
app.delete('/tareas/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    const tareas = await leerDatos(TAREAS_FILE);
    // Filtramos para quedarnos con todas MENOS la que tiene el ID a borrar
    const nuevasTareas = tareas.filter(t => t.id !== id);

    // Si el tamaño es igual, es que no borramos nada (no existía el ID)
    if (tareas.length === nuevasTareas.length) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Guardamos el nuevo array filtrado
    const guardado = await escribirDatos(TAREAS_FILE, nuevasTareas);

    if (guardado) {
        res.status(200).json({ message: 'Tarea eliminada correctamente' });
    } else {
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
});

// --- RUTAS DE AUTENTICACIÓN ---

// Registrar un nuevo usuario
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Validamos que vengan datos
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const usuarios = await leerDatos(USUARIOS_FILE);

    // Verificamos que no exista ya ese usuario
    if (usuarios.find(u => u.username === username)) {
        return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptamos la contraseña (hashing) con coste 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el usuario
    const nuevoUsuario = {
        id: Date.now().toString(),
        username,
        password: hashedPassword // Guardamos SOLO el hash, nunca la password real
    };

    usuarios.push(nuevoUsuario);

    const guardado = await escribirDatos(USUARIOS_FILE, usuarios);

    if (guardado) {
        res.status(201).json({ message: 'Usuario registrado exitosamente', id: nuevoUsuario.id });
    } else {
        res.status(500).json({ error: 'Error al guardar usuario' });
    }
});

// Iniciar sesión (Login)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const usuarios = await leerDatos(USUARIOS_FILE);
    // Buscamos usuario por nombre
    const usuario = usuarios.find(u => u.username === username);

    // Si no existe, error 401
    if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparamos la contraseña enviada con el hash guardado
    const esValida = await bcrypt.compare(password, usuario.password);

    if (!esValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Si todo es correcto, generamos un token JWT firmado
    const token = jwt.sign({ id: usuario.id, username: usuario.username }, SECRET_KEY, { expiresIn: '1h' });

    console.log(`[DEBUG] Login correcto para usuario: ${username}`);
    res.json({ message: 'Login exitoso', token });
});

// --- MANEJO DE ERRORES ---

// Middleware para rutas no encontradas (404)
// Se ejecuta si ninguna ruta anterior coincidió
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware Global de Errores (500)
// Captura cualquier error lanzado con next(err) o excepciones no controladas
app.use((err, req, res, next) => {
    console.error(err.stack); // Imprimimos el error en servidor
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciamos el servidor escuchando en el puerto definido
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
