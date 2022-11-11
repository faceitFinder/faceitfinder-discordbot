const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  discordId: String,
  steamId: String,
  faceitId: String,
  guildId: String
})

module.exports = mongoose.model('user', userSchema)