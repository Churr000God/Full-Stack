const express = require('express') // Importa el framework Express
const cors = require('cors') // Importa middleware CORS para habilitar peticiones cross-origin
const path = require('path') // Importa utilidades de rutas de Node

const app = express() // Crea instancia principal de la aplicación

app.use(cors()) // Habilita CORS en todas las rutas
app.use(express.json()) // Habilita parseo de JSON en req.body

app.use('/api/auth', require('./routes/auth.routes')) // Rutas de autenticación bajo /api/auth
app.use('/api/products', require('./routes/product.routes')) // Rutas de productos bajo /api/products

app.use(express.static(path.join(__dirname, '..', 'views'))) // Sirve archivos estáticos desde /views
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html')) // Responde con login.html
})
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin.html')) // Responde con admin.html
})

module.exports = app // Exporta app para usarla en server.js
