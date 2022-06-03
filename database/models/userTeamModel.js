const mongoose = require('mongoose')

const teamUserSchema = mongoose.Schema({
  slug: String,
  steamId: String,
  faceitId: String
})

module.exports = mongoose.model('teamUser', teamUserSchema)