const CommandsStats = require('../../database/commandsStats')
const Stats = require('../../commands/stats')
const { getTypeGraph } = require('../../functions/commandStats')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

/**
 * Update stats graph.
 */
module.exports = {
  name: 'uSG',
  async execute(interaction, json) {
    if (interaction.user.id !== json.u) return

    CommandsStats.create('stats', `button - ${getTypeGraph(json)}`, interaction)

    loadingCard(interaction)

    return Stats.sendCardWithInfo(interaction, json.s, CustomType.getType(interaction.component.label))
  }
}
