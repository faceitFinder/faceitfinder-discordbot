const UserTeam = require('./models/userTeamModel')

const create = (slug, steamId) => {
  const newUserTeam = new UserTeam({
    slug: slug,
    steamId: steamId,
  })

  newUserTeam.save((err) => {
    if (err) console.error(err)
  })
}

const getUserTeams = (steamId) => UserTeam.find({ steamId: steamId }).exec()

const getUserTeam = (steamId, slug) => UserTeam.findOne({ steamId: steamId, slug: slug }).exec()

const getTeamUsers = (slug) => UserTeam.find({ slug: slug }).exec()

const remove = (steamId, slug) => UserTeam.deleteOne({ steamId: steamId, slug: slug }).exec()

const count = () => UserTeam.countDocuments({})

module.exports = {
  create,
  getUserTeams,
  getUserTeam,
  getTeamUsers,
  count,
  remove
}