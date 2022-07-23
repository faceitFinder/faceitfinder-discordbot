const Team = require('./models/teamModel')

const create = (name, slug, discordId, access) => {
  const newTeam = new Team({
    name: name,
    slug: slug,
    creator: discordId,
    access: access
  })

  newTeam.save((err) => {
    if (err) console.error(err)
  })
}

const getTeamSlug = (slug) => Team.findOne({ slug: slug }).exec()

const getCreatorTeam = (discordId) => Team.findOne({ creator: discordId }).exec()

const remove = (discordId) => Team.deleteOne({ creator: discordId }).exec()

const update = (slug, newName, newSlug, access) => Team.updateOne({ slug: slug }, {
  $set:
    { name: newName, slug: newSlug, access: access }
}).exec()

const count = () => Team.countDocuments({})

module.exports = {
  create,
  getTeamSlug,
  getCreatorTeam,
  count,
  update,
  remove
}