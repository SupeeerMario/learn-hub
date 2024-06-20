// community-service/index.js

const express = require('express')
const connectToDB = require('./connectToDB')
const cookieParser = require('cookie-parser')
const communityRoutes = require('./src/Routes/communityRoutes')
const coursesRoutes = require('./src/Routes/courseRoutes')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8003

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000', // Adjust this to match your client URL
  credentials: true
}))
connectToDB()

app.use(cookieParser())

// Connect to the database
connectToDB()

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Received request for ${req.url}`)
  next()
})

// Use community routes
app.use('/community', communityRoutes)
app.use('/course', coursesRoutes)

app.listen(port, '0.0.0.0', () => {
  console.log(`Community service is running on port ${port}!`)
})
