const express = require('express')
const connectToDB = require('./connectToDB')
const authRoutes = require('./src/Routes/authRoutes')
/* const authMiddlewares = require('./src/middlewares/authMiddlewares') */
const cors = require('cors')
const session = require('express-session')
const app = express()
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 8002

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to 'true' if using HTTPS
}))

app.use(cookieParser())

connectToDB()
/* app.use(authMiddlewares.cookieParser()) */
app.use('/auth', authRoutes)

app.listen(port, '0.0.0.0', () => {
  console.log(`Authentication service is running on port ${port}!`)
})
