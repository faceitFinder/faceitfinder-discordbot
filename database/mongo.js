const mongoose = require('mongoose')

module.exports = async () => {
  mongoose.connect(process.env.MONGO_URI)
  return mongoose
}