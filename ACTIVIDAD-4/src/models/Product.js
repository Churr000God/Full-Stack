const mongoose = require('mongoose') // Importa Mongoose

const ProductSchema = new mongoose.Schema( // Define esquema de productos
  {
    name: { type: String, required: true, trim: true }, // Nombre del producto
    price: { type: Number, required: true, min: 0 }, // Precio >= 0
    description: { type: String, default: '' }, // Descripción opcional
    stock: { type: Number, default: 0, min: 0 }, // Stock inicial 0, no negativo
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Usuario creador
  },
  { versionKey: false, timestamps: true } // Sin __v; añade createdAt/updatedAt
)

module.exports = mongoose.model('Product', ProductSchema) // Exporta modelo Product
