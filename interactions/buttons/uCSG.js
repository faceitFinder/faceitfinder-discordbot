const CommandsStats = require('../../database/commandsStats')
const { getDefaultInteractionOption, getOptionsValues } = require('../../functions/commands')
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
    CommandsStats.create('compare', `button - ${getTypeGraph(json)}`, interaction)

    loadingCard(interaction)

    return sendCardWithInfo(interaction, {
      param: json.p1,
      faceitId: true
    }, {
      param: json.p2,
      faceitId: true
    }, CustomType.getType(interaction.component.label), json.m, json.c, json.g)
  },
  getJSON(interaction, json) {
    const values = getOptionsValues(interaction)
    return Object.assign({}, json, values)
  },
}
