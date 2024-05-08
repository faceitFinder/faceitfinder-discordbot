const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Last = require('../../commands/last')
const GuildRoles = require('../../functions/roles')
const { getTranslation } = require('../../languages/setup')

module.exports = {
  name: 'last',
  type: 2,
  async execute(interaction) {
    let user = await User.exists(interaction.targetId)
    if (!user) {
      user = await User.exists(interaction.targetId, interaction.guildId)
      if (!user) return errorCard(getTranslation('error.user.notLinked', interaction.locale, {
        discord: `<@${interaction.targetId}>`
      }), interaction.locale)
    }
    await GuildRoles.updateRoles(interaction.client, user.discordId, interaction.guild.id)
    return Last.sendCardWithInfo(interaction, {
      param: user.faceitId,
      faceitId: true
    })
  }
}
