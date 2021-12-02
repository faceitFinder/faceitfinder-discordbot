const Stats = require('../../commands/stats')
const { buildMessageFromInteraction } = require('../../functions/commands')

module.exports = {
  name: 'updateStatsGraph',
  async execute(interaction, json) {
    const { id, s, u, t } = json
    if (interaction.user.id !== u) return false
    const { message, args } = buildMessageFromInteraction(interaction)
    return await Stats.sendCardWithInfos(message, s, t)
  }
}
