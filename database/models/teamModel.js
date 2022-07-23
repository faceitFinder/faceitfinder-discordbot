const mongoose = require('mongoose')

const teamSchema = mongoose.Schema({
  name: String,
  slug: String,
  creator: String,
  access: Boolean,
})

module.exports = mongoose.model('team', teamSchema)