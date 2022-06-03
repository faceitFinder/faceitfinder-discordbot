const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  discordId: String,
  faceitId: String,
})

module.exports = mongoose.model('user', userSchema)