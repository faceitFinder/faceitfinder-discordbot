const mongoose = require('mongoose')

const teamUserSchema = mongoose.Schema({
  slug: String,
  steamId: String,
})

module.exports = mongoose.model('teamUser', teamUserSchema)