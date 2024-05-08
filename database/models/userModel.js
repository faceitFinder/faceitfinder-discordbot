const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  discordId: String,
  steamId: String,
  faceitId: String,
  guildId: String,
  nickname: Boolean,
  verified: Boolean,
})

module.exports = mongoose.model('user', userSchema)