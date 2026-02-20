require('dotenv').config() // Carga variables de entorno (.env)
const bcrypt = require('bcrypt') // Importa bcrypt para hashear contraseñas
const connectDB = require('./config/db') // Importa función de conexión a MongoDB
const User = require('./models/User') // Importa modelo User

;(async () => { // IIFE asíncrona para ejecutar automáticamente
  try { // Bloque de intento
    await connectDB() // Conecta a la base de datos
    const email = 'dhguilleng@gmail.com' // Email del usuario a crear
    const password = 'admin123' // Contraseña en texto plano
    const name = 'Dh Guillen' // Nombre del usuario

    const existing = await User.findOne({ email }) // Verifica si ya existe ese email
    if (existing) { // Si existe, no crea duplicados
      console.log('User already exists:', email) // Informa que ya existe
      process.exit(0) // Sale sin error
    }

    const passwordHash = await bcrypt.hash(password, 10) // Genera hash seguro de la contraseña
    await User.create({ name, email, passwordHash }) // Crea el usuario en la BD
    console.log('User created:', email) // Log de éxito
    process.exit(0) // Sale con éxito
  } catch (err) { // Captura y maneja errores
    console.error('Error creating user:', err.message) // Muestra mensaje de error
    process.exit(1) // Sale con error
  }
})() // Ejecuta inmediatamente
