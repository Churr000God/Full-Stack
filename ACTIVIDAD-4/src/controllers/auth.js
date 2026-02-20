const jwt = require('jsonwebtoken') // Importa librería para generar/verificar JWT
const User = require('../models/User') // Importa modelo User de Mongoose
const bcrypt = require('bcrypt') // Importa bcrypt para hashear y comparar contraseñas

const register = async (req, res) => { // Controlador de registro de usuario
  const { name, email, password } = req.body // Extrae datos del body
  const passwordHash = await bcrypt.hash(password, 10) // Hashea contraseña con 10 rondas de sal
  const user = await User.create({ name, email, passwordHash }) // Crea usuario en BD
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' }) // Token 1 día
  res.status(201).json({ token }) // Responde 201 con token
}

const login = async (req, res) => { // Controlador de inicio de sesión
  const { email, password } = req.body // Extrae credenciales
  const user = await User.findOne({ email }) // Busca usuario por email
  if (!user) return res.status(401).json({ error: 'invalid_credentials' }) // No existe → 401
  const ok = await user.comparePassword(password) // Compara contraseña con hash guardado
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' }) // Incorrecta → 401
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' }) // Token 1 día
  res.json({ token }) // Devuelve token
}

module.exports = { register, login } // Exporta controladores
