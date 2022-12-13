const Stats = require('../../commands/stats')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

/**
 * Update stats graph.
 */
module.exports = {
  name: 'uSG',
  async execute(interaction, json) {
    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return Stats.sendCardWithInfo(interaction, json.s, CustomType.getType(interaction.component.label))
  }
}
