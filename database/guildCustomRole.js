const GuildCustomRole = require('./models/guildCustomRoleModel')

const create = (
  guildId,
  roleId,
  eloMin,
  eloMax
) => {
  const newGuildCustomRole = new GuildCustomRole({
    guildId: guildId,
    roleId: roleId,
    eloMin: eloMin,
    eloMax: eloMax
  })

  newGuildCustomRole.save()
}

const remove = (guildId, roleId) => GuildCustomRole.deleteOne({ guildId: guildId, roleId: roleId }).exec()

const removeAll = (guildId) => GuildCustomRole.deleteMany({ guildId: guildId }).exec()

const getAll = () => GuildCustomRole.find({}).exec()

const getOne = (guildId, roleId) => GuildCustomRole.findOne({ guildId: guildId, roleId: roleId }).exec()

const getRolesOf = (guildId) => GuildCustomRole.find({ guildId: guildId }).exec()

module.exports = {
  create,
  remove,
  getOne,
  getAll,
  getRolesOf,
  removeAll
}