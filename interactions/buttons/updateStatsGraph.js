const Stats = require('../../commands/stats')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'updateStatsGraph',
  async execute(interaction, json) {
    if (interaction.user.id !== json.u) return false
    
    loadingCard(interaction)

    return await Stats.sendCardWithInfos(interaction, json.s, CustomType.getType(interaction.component.label))
  }
}
