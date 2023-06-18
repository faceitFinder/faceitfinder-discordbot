const mongoose = require('mongoose')

const guildCustomRoleSchema = mongoose.Schema({
  guildId: String,
  roleId: String,
  eloMin: Number,
  eloMax: Number
})

module.exports = mongoose.model('guildCustomRole', guildCustomRoleSchema)