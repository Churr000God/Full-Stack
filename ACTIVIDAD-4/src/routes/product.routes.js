const { Router } = require('express') // Importa Router de Express
const { list, create, read, update, remove, move, movements } = require('../controllers/products') // Importa controladores
const auth = require('../middlewares/auth') // Importa middleware JWT

const router = Router() // Crea router de productos

router.use(auth) // Aplica auth a todas las rutas (requiere token)
router.get('/', list) // Listado de productos
router.get('/:id', read) // Detalle de producto
router.post('/', create) // Crear producto
router.put('/:id', update) // Actualizar producto
router.delete('/:id', remove) // Eliminar producto
router.post('/:id/movements', move) // Registrar entrada/salida de inventario
router.get('/:id/movements', movements) // Ver historial de movimientos

module.exports = router // Exporta router
