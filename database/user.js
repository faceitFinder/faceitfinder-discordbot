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

const get = async (discordId) => await User.findOne({ discordId: discordId }).exec()

const exists = async (discordId) => (await get(discordId))

const update = async (discordId, steamId) => await User.updateOne({ discordId: discordId }, { steamId: steamId }).exec()

module.exports = {
  create,
  get,
  exists,
  update
}