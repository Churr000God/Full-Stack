require('dotenv').config() // Carga variables de entorno desde .env
const app = require('./app') // Importa la aplicación Express
const connectDB = require('./config/db') // Importa función de conexión a la base de datos

const PORT = process.env.PORT || 3000 // Determina el puerto de escucha

connectDB() // Intenta conectar a MongoDB
  .then(() => {
    app.listen(PORT) // Arranca el servidor HTTP
  })
  .catch((err) => {
    console.error('DB connection error:', err.message) // Log de error de conexión
    process.exit(1) // Termina el proceso en caso de fallo
  })
