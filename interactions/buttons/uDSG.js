const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../selectmenus/dateStatsSelector')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')
const { getDefaultInteractionOption } = require('../../functions/commands')
const { getTypeGraph } = require('../../functions/commandStats')

/**
 * Update date stats graph.
 */
module.exports = {
  name: 'uDSG',
  async execute(interaction, json) {
    const commandName = interaction.message.interaction.commandName
    CommandsStats.create(commandName, `button - ${getTypeGraph(json)}`, interaction)

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json, CustomType.getType(interaction.component.label))
  },
  getJSON(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    return { ...json, ...JSON.parse(values) }
  },
}
