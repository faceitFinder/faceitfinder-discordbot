const Stats = require('../../commands/stats')
const CustomType = require('../../templates/customType')
const { buildMessageFromInteraction } = require('../../functions/commands')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'updateStatsGraph',
  async execute(interaction, json) {
    if (interaction.user.id !== json.u) return false
    
    loadingCard(interaction)

    const { message, args } = buildMessageFromInteraction(interaction)

    return await Stats.sendCardWithInfos(message, json.s, CustomType.getType(interaction.component.label))
  }
}
