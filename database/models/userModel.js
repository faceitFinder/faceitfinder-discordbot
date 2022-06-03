const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  discordId: String,
  steamId: String,
  faceitId: String,
})

module.exports = mongoose.model('user', userSchema)