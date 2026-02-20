const request = require('supertest') // Importa supertest para peticiones HTTP
const mongoose = require('mongoose') // Importa Mongoose para conexión
const { MongoMemoryServer } = require('mongodb-memory-server') // BD en memoria para pruebas
const app = require('../../src/app') // Importa app Express

let mongod // Servidor Mongo en memoria
let token // Token de usuario registrado para pruebas

beforeAll(async () => { // Preparación de entorno antes de pruebas
  process.env.JWT_SECRET = 'testsecret' // Secreto JWT para pruebas
  mongod = await MongoMemoryServer.create() // Crea servidor Mongo en memoria
  const uri = mongod.getUri() // URI de conexión
  await mongoose.connect(uri) // Conecta Mongoose
  const email = 'p@example.com' // Email de prueba
  const password = 'secret123' // Contraseña de prueba
  const name = 'protected' // Nombre de prueba
  const reg = await request(app).post('/api/auth/register').send({ email, password, name }) // Registra usuario
  token = reg.body.token // Guarda token
})

afterAll(async () => { // Limpieza tras pruebas
  await mongoose.disconnect() // Desconecta Mongoose
  await mongod.stop() // Detiene servidor en memoria
})

test('GET /api/products fails without token', async () => { // Falta de token → 401
  const res = await request(app).get('/api/products') // Sin Authorization
  expect(res.status).toBe(401) // Debe responder 401
})

test('GET /api/products fails with invalid token', async () => { // Token incorrecto → 401
  const res = await request(app).get('/api/products').set('Authorization', 'Bearer invalid123') // Token inválido
  expect(res.status).toBe(401) // Debe responder 401
})

test('GET /api/products succeeds with valid token', async () => { // Token válido → 200
  const res = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`) // Envía token válido
  expect(res.status).toBe(200) // Debe responder 200
})
