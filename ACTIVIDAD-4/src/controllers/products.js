const Product = require('../models/Product') // Modelo de productos
const Movement = require('../models/Movement') // Modelo de movimientos de inventario

const list = async (req, res) => { // Lista todos los productos
  const items = await Product.find().lean() // Obtiene productos como objetos simples
  res.json(items) // Devuelve lista en JSON
}

const create = async (req, res) => { // Crea un producto nuevo
  const payload = { ...req.body, createdBy: req.user.id } // Asocia al usuario autenticado
  try {
    const created = await Product.create(payload) // Crea en BD
    res.status(201).json(created) // Devuelve 201 con doc creado
  } catch (err) {
    res.status(400).json({ error: 'validation_error', message: err.message }) // Valida errores de esquema
  }
}

const read = async (req, res) => { // Detalle de producto
  const { id } = req.params // Id recibido en la URL
  const found = await Product.findById(id).lean() // Busca por _id
  if (!found) return res.status(404).json({ error: 'not_found' }) // No existe → 404
  res.json(found) // Devuelve documento
}

const update = async (req, res) => { // Actualiza producto (solo dueño)
  const { id } = req.params // Id del producto
  const doc = await Product.findById(id) // Busca documento
  if (!doc) return res.status(404).json({ error: 'not_found' }) // No existe → 404
  if (String(doc.createdBy) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' }) // No autorizado → 403
  const fields = ['name', 'description', 'price', 'stock'] // Campos editables
  for (const k of fields) {
    if (k in req.body) doc[k] = req.body[k] // Aplica cambios permitidos
  }
  try {
    await doc.save() // Guarda cambios en BD
    res.json(doc) // Devuelve doc actualizado
  } catch (err) {
    res.status(400).json({ error: 'validation_error', message: err.message }) // Error de validación
  }
}

const remove = async (req, res) => { // Elimina producto (solo dueño)
  const { id } = req.params // Id del producto
  const doc = await Product.findById(id) // Busca documento
  if (!doc) return res.status(404).json({ error: 'not_found' }) // No existe → 404
  if (String(doc.createdBy) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' }) // No autorizado → 403
  await doc.deleteOne() // Borra el documento
  res.status(204).end() // 204 sin contenido
}

const move = async (req, res) => { // Registra entrada/salida de inventario
  const { id } = req.params // Id del producto
  const { type, quantity, note } = req.body // Tipo, cantidad, nota
  const doc = await Product.findById(id) // Busca producto
  if (!doc) return res.status(404).json({ error: 'not_found' }) // No existe → 404
  if (String(doc.createdBy) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' }) // Solo dueño
  const qty = Number(quantity) // Convierte cantidad a número
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: 'invalid_quantity' }) // Valida > 0
  if (type === 'out' && doc.stock - qty < 0) return res.status(400).json({ error: 'insufficient_stock' }) // Evita negativos
  if (type === 'in') doc.stock += qty // Entrada → suma
  if (type === 'out') doc.stock -= qty // Salida → resta
  try {
    await doc.save() // Guarda stock actualizado
    const movement = await Movement.create({ // Crea registro de movimiento
      product: doc._id,
      user: req.user.id,
      type,
      quantity: qty,
      note: note || ''
    })
    res.status(201).json({ product: doc, movement }) // Devuelve producto y movimiento
  } catch (err) {
    res.status(400).json({ error: 'validation_error', message: err.message }) // Error de validación
  }
}

const movements = async (req, res) => { // Lista historial de movimientos
  const { id } = req.params // Id del producto
  const doc = await Product.findById(id) // Verifica existencia
  if (!doc) return res.status(404).json({ error: 'not_found' }) // No existe → 404
  if (String(doc.createdBy) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' }) // Solo dueño
  const items = await Movement.find({ product: id }).sort({ createdAt: -1 }).lean() // Movimientos desc
  res.json(items) // Devuelve lista
}

module.exports = { list, create, read, update, remove, move, movements } // Exporta controladores
