const request = require('supertest') // Importa supertest para peticiones HTTP
const mongoose = require('mongoose') // Importa Mongoose para conexión
const { MongoMemoryServer } = require('mongodb-memory-server') // BD en memoria para pruebas
const app = require('../../src/app') // Importa la app Express

let mongod // Servidor Mongo en memoria
let tokenA // Token del usuario A (dueño del producto)
let tokenB // Token del usuario B (no dueño)
let productId // ID del producto creado

beforeAll(async () => { // Preparación antes de pruebas
  process.env.JWT_SECRET = 'testsecret' // Secreto JWT para pruebas
  mongod = await MongoMemoryServer.create() // Crea servidor Mongo en memoria
  const uri = mongod.getUri() // URI de conexión
  await mongoose.connect(uri) // Conecta Mongoose
  const regA = await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: 'secret123', name: 'A' }) // Registra usuario A
  tokenA = regA.body.token // Token de A
  const regB = await request(app).post('/api/auth/register').send({ email: 'b@example.com', password: 'secret123', name: 'B' }) // Registra usuario B
  tokenB = regB.body.token // Token de B
})

afterAll(async () => { // Limpieza tras pruebas
  await mongoose.disconnect() // Desconecta Mongoose
  await mongod.stop() // Detiene servidor en memoria
})

test('Create product with owner A', async () => { // Crea producto con dueño A
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${tokenA}`) // Token del dueño A
    .send({ name: 'P1', price: 10, stock: 5, description: 'ok' }) // Datos del producto
  expect(res.status).toBe(201) // Debe crear (201)
  productId = res.body._id // Guarda id del producto
})

test('Read product detail', async () => { // Lee detalle del producto
  const res = await request(app).get(`/api/products/${productId}`).set('Authorization', `Bearer ${tokenA}`) // Token A
  expect(res.status).toBe(200) // Debe responder 200
  expect(res.body._id).toBe(productId) // ID debe coincidir
})

test('Update product by owner A succeeds', async () => { // Actualiza producto con dueño A
  const res = await request(app)
    .put(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${tokenA}`) // Token A
    .send({ price: 12 }) // Cambia precio
  expect(res.status).toBe(200) // Debe actualizar (200)
  expect(res.body.price).toBe(12) // Valida precio actualizado
})

test('Update product by user B forbidden', async () => { // Usuario B no puede actualizar
  const res = await request(app)
    .put(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${tokenB}`) // Token B
    .send({ price: 20 }) // Intenta cambiar precio
  expect(res.status).toBe(403) // Debe ser prohibido (403)
})

test('Validation error on create with negative price', async () => { // Validación de precio negativo
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${tokenA}`) // Token A
    .send({ name: 'Bad', price: -1 }) // Precio inválido
  expect(res.status).toBe(400) // Debe responder 400
})

test('Validation error on update to negative stock', async () => { // Validación de stock negativo
  const res = await request(app)
    .put(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${tokenA}`) // Token A
    .send({ stock: -5 }) // Stock inválido
  expect(res.status).toBe(400) // Debe responder 400
})

test('Delete by owner A succeeds', async () => { // Eliminar por dueño A
  const res = await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${tokenA}`) // Token A
  expect(res.status).toBe(204) // Debe eliminar (204)
})

test('Delete non-existent returns 404', async () => { // Eliminar un id inexistente
  const fakeId = '507f1f77bcf86cd799439011' // ID válido en formato, pero inexistente
  const res = await request(app)
    .delete(`/api/products/${fakeId}`)
    .set('Authorization', `Bearer ${tokenA}`) // Token A
  expect(res.status).toBe(404) // Debe responder 404
})
