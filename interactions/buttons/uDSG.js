const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../selectmenus/dateStatsSelector')
const CustomType = require('../../templates/customType')
const { loadingCard } = require('../../templates/loadingCard')
const { getDefaultInteractionOption, getOptionsValues } = require('../../functions/commands')

/**
 * Update date stats graph.
 */
module.exports = {
  name: 'uDSG',
  async execute(interaction, json) {
    const commandName = await interaction.message.fetchReference()
      .then((message) => message.interaction.commandName)
      .catch(() => interaction.message.interaction.commandName)
    CommandsStats.create(commandName, `button - ${json.t.name}`, interaction)

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json, CustomType.getType(interaction.component.label))
  },
  getJSON(interaction, json) {
    const values = JSON.parse(getDefaultInteractionOption(interaction, 1).value)
    const interactionValues = getOptionsValues(interaction)
    const dataRow = interaction.message.components.at(0)

    return Object.assign({}, json, values, interactionValues, { dataRow })
  },
  updateUser(interaction) {
    const values = this.getJSON(interaction)
    const dataRowValues = JSON.parse(values.dataRow.components.at(0).options.at(0).value)
    dataRowValues.u = interaction.user.id
    values.dataRow.components.at(0).options.at(0).value = JSON.stringify(dataRowValues)

    return values
  }
}
