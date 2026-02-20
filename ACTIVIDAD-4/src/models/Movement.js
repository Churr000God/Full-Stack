const mongoose = require('mongoose') // Importa Mongoose

const MovementSchema = new mongoose.Schema( // Define esquema de movimientos
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Producto afectado
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Usuario que realiza el movimiento
    type: { type: String, enum: ['in', 'out'], required: true }, // Tipo de movimiento: entrada/salida
    quantity: { type: Number, required: true, min: 1 }, // Cantidad mínima 1
    note: { type: String, default: '' } // Nota opcional
  },
  { versionKey: false, timestamps: true } // Sin __v; con createdAt/updatedAt
)

module.exports = mongoose.model('Movement', MovementSchema) // Exporta modelo Movement
