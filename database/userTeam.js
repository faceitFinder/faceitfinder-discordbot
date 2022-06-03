const UserTeam = require('./models/userTeamModel')

const create = (slug, faceitId) => {
  const newUserTeam = new UserTeam({
    slug: slug,
    faceitId: faceitId
  })

  newUserTeam.save((err) => {
    if (err) console.error(err)
  })
}

const getUserTeams = (faceitId) => UserTeam.find({ faceitId: faceitId }).exec()

const getUserTeam = (faceitId, slug) => UserTeam.findOne({ faceitId: faceitId, slug: slug }).exec()

const getTeamUsers = (slug) => UserTeam.find({ slug: slug }).exec()

const remove = (faceitId, slug) => UserTeam.deleteOne({ faceitId: faceitId, slug: slug }).exec()

const updateMany = (slug, newSlug) => UserTeam.updateMany({ slug: slug }, { slug: newSlug }).exec()

const updateOne = (steamId, faceitId) => UserTeam.updateOne({ steamId: steamId }, { faceitId: faceitId }).exec()

const getAll = () => UserTeam.find({}).exec()

const count = () => UserTeam.countDocuments({})

module.exports = {
  create,
  getUserTeams,
  getUserTeam,
  getTeamUsers,
  count,
  remove,
  updateMany,
  updateOne,
  getAll
}