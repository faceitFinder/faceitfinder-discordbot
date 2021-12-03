const Stats = require('../../commands/stats')
const CustomType = require('../../templates/customType')
const { buildMessageFromInteraction } = require('../../functions/commands')

module.exports = {
  name: 'updateStatsGraph',
  async execute(interaction, json) {
    const { id, s, u, t } = json
    if (interaction.user.id !== u) return false
    const type = Object.entries(CustomType).filter(e => e[1].n === t)[0][1]
    const { message, args } = buildMessageFromInteraction(interaction)
    return await Stats.sendCardWithInfos(message, s, type)
  }
}
