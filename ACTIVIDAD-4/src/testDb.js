require('dotenv').config()
const connectDB = require('./config/db')

;(async () => {
  try {
    const conn = await connectDB()
    console.log('DB OK:', conn.name, conn.host)
    process.exit(0)
  } catch (err) {
    console.error('DB ERROR:', err.message)
    process.exit(1)
  }
})()

