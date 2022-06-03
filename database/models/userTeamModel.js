const mongoose = require('mongoose')

const teamUserSchema = mongoose.Schema({
  slug: String,
  faceitId: String
})

module.exports = mongoose.model('teamUser', teamUserSchema)