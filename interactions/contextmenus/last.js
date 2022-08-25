const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Last = require('../../commands/last')
const GuildRoles = require('../../functions/roles')

module.exports = {
  name: 'last',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    await GuildRoles.updateRoles(interaction.client, user.discordId)
    return Last.sendCardWithInfos(interaction, user.faceitId)
  }
}