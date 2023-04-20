const CommandsStats = require('../../database/commandsStats')
const { getDefaultInteractionOption } = require('../../functions/commands')
const { sendCardWithInfo } = require('../../commands/compare')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')
const { getTypeGraph } = require('../../functions/commandStats')

/**
 * Update compare stats graph.
 */
module.exports = {
  name: 'uCSG',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    const matchDatas = getDefaultInteractionOption(interaction, 0, 0, 1, false).value
    json = { ...json, ...JSON.parse(values), ...JSON.parse(matchDatas) }

    CommandsStats.create('compare', `button - ${getTypeGraph(json)}`, interaction)

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json.p1, json.p2, CustomType.getType(interaction.component.label), json.m, json.c)
  }
}
