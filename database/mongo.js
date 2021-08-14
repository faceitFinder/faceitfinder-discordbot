const mongoose = require('mongoose')
require('dotenv').config()

module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  return mongoose
}