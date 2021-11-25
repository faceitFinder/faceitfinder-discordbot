const Stats = require('../../commands/stats')

module.exports = {
  name: 'updateStatsGraph',
  async execute(interaction, steamId, customId) {
    const user = interaction.message.mentions.users.get(interaction.user.id)
    if (!user) return false

    return await Stats.sendCardWithInfos(null, steamId, customId)
  }
}