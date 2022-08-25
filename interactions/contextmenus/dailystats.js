const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Dailystats = require('../../commands/dailystats')
const GuildRoles = require('../../functions/roles')

module.exports = {
  name: 'dailystats',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    await GuildRoles.updateRoles(interaction.client, user.discordId)
    return Dailystats.sendCardWithInfos(interaction, user.faceitId)
  }
}