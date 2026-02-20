const mongoose = require('mongoose') // Importa Mongoose para crear ObjectId y conectar
const { MongoMemoryServer } = require('mongodb-memory-server') // BD en memoria para tests unitarios
const Product = require('../../src/models/Product') // Modelo Product para verificaciones
const { create } = require('../../src/controllers/products') // Controlador create a probar

let mongod // Servidor Mongo en memoria

function mockRes() { // Crea un objeto res simulado (mock)
  const res = {} // Objeto respuesta
  res.statusCode = 200 // Código por defecto
  res.body = null // Body por defecto
  res.status = (code) => { // Simula res.status()
    res.statusCode = code // Ajusta status code
    return res // Permite encadenar
  }
  res.json = (payload) => { // Simula res.json()
    res.body = payload // Guarda body enviado
    return res // Permite encadenar
  }
  res.end = () => res // Simula res.end()
  return res // Devuelve el mock
}

beforeAll(async () => { // Preparación: levantar BD en memoria
  mongod = await MongoMemoryServer.create() // Crea servidor en memoria
  const uri = mongod.getUri() // Obtiene URI
  await mongoose.connect(uri) // Conecta Mongoose
})

afterAll(async () => { // Limpieza tras pruebas
  await mongoose.disconnect() // Desconecta Mongoose
  await mongod.stop() // Detiene servidor en memoria
})

test('create returns 201 for valid payload', async () => { // Debe crear con payload válido
  const req = { // Mock de req
    user: { id: new mongoose.Types.ObjectId().toString() }, // Simula usuario autenticado
    body: { name: 'Unit', price: 1, stock: 0, description: 'ok' } // Datos válidos de producto
  }
  const res = mockRes() // Mock de res
  await create(req, res) // Ejecuta controlador
  expect(res.statusCode).toBe(201) // Debe responder 201
  expect(res.body.name).toBe('Unit') // Nombre debe ser el enviado
  const count = await Product.countDocuments() // Cuenta documentos creados
  expect(count).toBe(1) // Debe existir 1 producto
})

test('create returns 400 for invalid payload', async () => { // Payload inválido → 400
  const req = { // Mock de req
    user: { id: new mongoose.Types.ObjectId().toString() }, // Usuario autenticado
    body: { name: 'Bad', price: -1 } // Precio negativo (invalida)
  }
  const res = mockRes() // Mock de res
  await create(req, res) // Ejecuta controlador
  expect(res.statusCode).toBe(400) // Debe responder 400
})
