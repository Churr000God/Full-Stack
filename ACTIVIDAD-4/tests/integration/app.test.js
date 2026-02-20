const request = require('supertest') // Importa supertest para hacer peticiones HTTP a la app
const mongoose = require('mongoose') // Importa Mongoose para conectar a la base de datos
const { MongoMemoryServer } = require('mongodb-memory-server') // BD Mongo en memoria para pruebas
const app = require('../../src/app') // Importa la aplicación Express

let mongod // Referencia al servidor Mongo en memoria
let token // Token JWT emitido al registrar usuario

beforeAll(async () => { // Antes de todas las pruebas: preparar entorno
  process.env.JWT_SECRET = 'testsecret' // Define secreto JWT para firmar tokens en pruebas
  mongod = await MongoMemoryServer.create() // Crea servidor Mongo en memoria
  const uri = mongod.getUri() // Obtiene la URI de conexión
  await mongoose.connect(uri) // Conecta Mongoose a la BD en memoria
  const email = 't@example.com' // Email de prueba
  const password = 'secret123' // Contraseña de prueba
  const name = 'tester' // Nombre de prueba
  const reg = await request(app).post('/api/auth/register').send({ email, password, name }) // Registra usuario
  token = reg.body.token // Guarda token para pruebas protegidas
})

afterAll(async () => { // Después de todas las pruebas: limpiar
  await mongoose.disconnect() // Desconecta Mongoose
  await mongod.stop() // Detiene BD en memoria
})

test('GET /api/products returns 200 (protected)', async () => { // Lista productos requiere token
  const res = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`) // Envía token
  expect(res.status).toBe(200) // Debe responder 200
  expect(Array.isArray(res.body)).toBe(true) // Body debe ser array
})

test('Register, login and create product', async () => { // Flujo completo: registro, login y creación
  const email = 'u@example.com' // Email nuevo
  const password = 'secret123' // Contraseña
  const name = 'user1' // Nombre
  const reg = await request(app).post('/api/auth/register').send({ email, password, name }) // Registra
  expect(reg.status).toBe(201) // Debe crear usuario
  const token = reg.body.token // Token resultante
  const login = await request(app).post('/api/auth/login').send({ email, password }) // Inicia sesión
  expect(login.status).toBe(200) // Login correcto
  const create = await request(app) // Crea producto con token
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Prod', price: 10 })
  expect(create.status).toBe(201) // Debe crear producto
  expect(create.body.name).toBe('Prod') // Valida nombre
})
