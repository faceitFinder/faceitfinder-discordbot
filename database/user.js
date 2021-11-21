const User = require('./models/userModel')

const create = (discordId, steamId) => {
  const newUser = new User({
    discordId: discordId,
    steamId: steamId
  })

  newUser.save((err) => {
    if (err) console.error(err)
  })
}

const get = (discordId) => User.findOne({ discordId: discordId }).exec()

const remove = (discordId) => User.deleteOne({ discordId: discordId }).exec()

const exists = (discordId) => get(discordId)

const update = (discordId, steamId) => User.updateOne({ discordId: discordId }, { steamId: steamId }).exec()

const count = () => User.countDocuments({})

module.exports = {
  create,
  get,
  exists,
  update,
  count,
  remove
}