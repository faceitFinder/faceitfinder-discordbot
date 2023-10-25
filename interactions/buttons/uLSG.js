const CommandsStats = require('../../database/commandsStats')
const { getOptionsValues } = require('../../functions/commands')
const { getCardWithInfo, updateOptions } = require('../../functions/dateStats')
const CustomType = require('../../templates/customType')
const { loadingCard } = require('../../templates/loadingCard')

/**
 * Update last stats graph.
 */
module.exports = {
  name: 'uLSG',
  async execute(interaction, json) {
    CommandsStats.create('laststats', `button - ${json.t.name}`, interaction)

    loadingCard(interaction)

    const actionRow = interaction.message.components.at(0)
    const [from, to] = interaction.message.embeds.at(0).data.fields[0].value.split('\n').map(e => new Date(e.trim()))

    const options = updateOptions(actionRow.components, JSON.stringify(json))
    options.at(0).default = true
    actionRow.components.at(0).options = options

    json.f = from.getTime() / 1000
    json.t = to.setHours(+24) / 1000

    return getCardWithInfo(interaction,
      actionRow,
      json,
      CustomType.getType(interaction.component.label),
      'uLSG',
      json.m,
      null,
      null,
      json.c,
      true,
      json.g
    )
  },
  getJSON(interaction, json) {
    const values = getOptionsValues(interaction)

    return {
      ...json,
      ...values
    }
  }
}
