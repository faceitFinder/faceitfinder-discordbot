const User = require('./models/userModel')

const create = (discordId, faceitId, guildId) => {
  const newUser = new User({
    discordId: discordId,
    faceitId: faceitId,
    guildId: guildId
  })

  newUser.save((err) => {
    if (err) console.error(err)
  })
}

const get = (discordId) => User.find({ discordId: discordId }).exec()

const getWithGuild = (discordId, guildId = null) => User.findOne({ discordId: discordId, guildId: guildId }).exec()

const remove = (discordId, guildId = null) => guildId ?
  User.deleteOne({ discordId: discordId, guildId: guildId }).exec() :
  User.deleteMany({ discordId: discordId }).exec()

const exists = (discordId, guildId = null) => getWithGuild(discordId, guildId)

const update = (discordId, faceitId, guildId = null) => User.updateOne({ discordId: discordId, guildId: guildId }, { faceitId: faceitId }).exec()

const getAll = () => User.find({}).exec()

const count = () => User.countDocuments({})

module.exports = {
  create,
  get,
  exists,
  update,
  count,
  remove,
  getAll,
  getWithGuild
}