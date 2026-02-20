const jwt = require('jsonwebtoken') // Importa librería JWT

module.exports = function (req, res, next) { // Middleware de protección con JWT
  const header = req.headers.authorization || '' // Lee header Authorization
  const parts = header.split(' ') // Divide por espacio (espera "Bearer <token>")
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'unauthorized' }) // Valida formato
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET) // Verifica token con JWT_SECRET
    req.user = { id: payload.id, email: payload.email } // Inyecta usuario en req
    next() // Continúa la cadena de middlewares
  } catch {
    res.status(401).json({ error: 'unauthorized' }) // Token inválido/expirado → 401
  }
}
