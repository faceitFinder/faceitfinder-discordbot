const mongoose = require('mongoose')

const guildRolesSchema = mongoose.Schema({
  id: String,
  level1: String,
  level2: String,
  level3: String,
  level4: String,
  level5: String,
  level6: String,
  level7: String,
  level8: String,
  level9: String,
  level10: String
})

module.exports = mongoose.model('guildRoles', guildRolesSchema)