const bcrypt = require('bcrypt') // Importa bcrypt para hashear y verificar contraseñas

test('bcrypt hashes and verifies password', async () => { // Prueba de hash y verificación
  const plain = 'secret123' // Contraseña en texto plano
  const hash = await bcrypt.hash(plain, 10) // Genera hash con 10 rondas
  const ok = await bcrypt.compare(plain, hash) // Compara texto plano contra hash
  expect(ok).toBe(true) // Debe ser verdadero (coincide)
})
