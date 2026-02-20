const mongoose = require('mongoose') // Importa Mongoose, ODM para MongoDB

module.exports = async function connectDB() { // Exporta función de conexión asíncrona
  const uri = process.env.DB_URI || process.env.MONGODB_URI // Lee URI desde variables de entorno
  if (!uri) throw new Error('DB_URI or MONGODB_URI is required') // Valida que exista configuración
  await mongoose.connect(uri) // Realiza la conexión a MongoDB
  return mongoose.connection // Devuelve objeto de conexión para inspección/log
}
