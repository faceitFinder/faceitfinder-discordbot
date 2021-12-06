const Stats = require('../../commands/stats')
const CustomType = require('../../templates/customType')
const { buildMessageFromInteraction } = require('../../functions/commands')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'updateStatsGraph',
  async execute(interaction, json) {
    const { id, s, u, t } = json
    if (interaction.user.id !== u) return false

    loadingCard(interaction)

    const type = CustomType.getType(t)
    const { message, args } = buildMessageFromInteraction(interaction)
    return await Stats.sendCardWithInfos(message, s, type)
  }
}
