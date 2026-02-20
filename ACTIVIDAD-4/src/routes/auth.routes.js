const { Router } = require('express') // Importa constructor Router de Express
const { register, login } = require('../controllers/auth') // Importa controladores de auth

const router = Router() // Crea instancia de router

router.post('/register', register) // POST /api/auth/register → registro de usuario
router.post('/login', login) // POST /api/auth/login → inicio de sesión

module.exports = router // Exporta router para app.js
