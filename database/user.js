const User = require('./models/userModel')

const create = (discordId, faceitId, guildId, nickname) => {
  const newUser = new User({
    discordId: discordId,
    faceitId: faceitId,
    guildId: guildId,
    nickname: nickname,
    verified: false,
  })

  newUser.save()
}

const get = (discordId) => User.find({ discordId: discordId }).exec()

const getWithGuild = (discordId, guildId = null) => User.findOne({ discordId: discordId, guildId: guildId }).exec()

const remove = (discordId, guildId = null, all = true) => guildId || !guildId && !all ?
  User.deleteOne({ discordId: discordId, guildId: guildId }).exec() :
  User.deleteMany({ discordId: discordId }).exec()

const exists = (discordId, guildId = null) => getWithGuild(discordId, guildId)

const update = (discordId, faceitId, guildId = null, nickname) => User.updateOne(
  { discordId: discordId, guildId: guildId },
  { faceitId: faceitId, nickname: nickname, verified: false }
).exec()

const getAll = () => User.find({}).exec()

const count = () => User.countDocuments({})

const getVerified = (discordId) => User.find({ discordId: discordId, verified: true }).exec()

module.exports = {
  create,
  get,
  exists,
  update,
  count,
  remove,
  getAll,
  getWithGuild,
  getVerified,
}