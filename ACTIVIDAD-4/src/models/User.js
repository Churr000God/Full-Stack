const mongoose = require('mongoose') // Importa Mongoose
const bcrypt = require('bcrypt') // Importa bcrypt para comparar contraseñas

const UserSchema = new mongoose.Schema( // Define esquema de usuarios
  {
    name: { type: String, required: true, trim: true }, // Nombre del usuario
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Email único normalizado
    passwordHash: { type: String, required: true }, // Hash de contraseña
    createdAt: { type: Date, default: Date.now } // Fecha de creación
  },
  { versionKey: false } // Sin __v
)

UserSchema.methods.comparePassword = function (plain) { // Método para validar contraseña
  return bcrypt.compare(plain, this.passwordHash) // Compara texto plano con hash almacenado
}

module.exports = mongoose.model('User', UserSchema) // Exporta modelo User
