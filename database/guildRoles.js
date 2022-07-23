const GuildRoles = require('./models/guildRolesModel')

const create = (id, level1, level2, level3, level4, level5, level6, level7, level8, level9, level10) => {
  const newGuildRoles = new GuildRoles({
    id: id,
    level1: level1,
    level2: level2,
    level3: level3,
    level4: level4,
    level5: level5,
    level6: level6,
    level7: level7,
    level8: level8,
    level9: level9,
    level10: level10
  })

  newGuildRoles.save((err) => {
    if (err) console.error(err)
  })
}

const remove = (id) => GuildRoles.deleteOne({ id: id }).exec()

const getAll = () => GuildRoles.find({}).exec()

const getRolesOf = (id) => GuildRoles.findOne({ id: id }).exec()

module.exports = {
  create,
  remove,
  getRolesOf,
  getAll
}