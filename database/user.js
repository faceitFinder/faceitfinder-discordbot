const User = require('./models/userModel')

const create = (discordId, faceitId) => {
  const newUser = new User({
    discordId: discordId,
    faceitId: faceitId
  })

  newUser.save((err) => {
    if (err) console.error(err)
  })
}

const get = (discordId) => User.findOne({ discordId: discordId }).exec()

const remove = (discordId) => User.deleteOne({ discordId: discordId }).exec()

const exists = (discordId) => get(discordId)

const update = (discordId, faceitId) => User.updateOne({ discordId: discordId }, { faceitId: faceitId }).exec()

const count = () => User.countDocuments({})

module.exports = {
  create,
  get,
  exists,
  update,
  count,
  remove
}