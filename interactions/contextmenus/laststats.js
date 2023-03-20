const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Laststats = require('../../commands/laststats')
const GuildRoles = require('../../functions/roles')

module.exports = {
  name: 'laststats',
  type: 2,
  async execute(interaction) {
    let user = await User.exists(interaction.targetId)
    if (!user) {
      user = await User.exists(interaction.targetId, interaction.guildId)
      if (!user) return errorCard('This user has not linked his profile', interaction.locale)
    }
    await GuildRoles.updateRoles(interaction.client, user.discordId)
    return Laststats.sendCardWithInfo(interaction, user.faceitId)
  }
}