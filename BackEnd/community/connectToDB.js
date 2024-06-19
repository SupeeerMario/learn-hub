const mongoose = require('mongoose')
const dotenv = require('dotenv')
const config = require('./src/Config/config')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '.env') })

const connectToDB = async () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  try {
    await mongoose.connect(config.mongoURI, connectionParams, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000
    })
    console.log('Connected to DB')
  } catch (error) {
    console.log('Could not connect to DB')
    console.error(error)
  }
}

module.exports = connectToDB
