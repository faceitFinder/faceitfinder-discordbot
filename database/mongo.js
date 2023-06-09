const mongoose = require('mongoose')

module.exports = async () => {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  return mongoose
}