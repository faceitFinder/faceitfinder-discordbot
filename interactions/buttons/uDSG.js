const { sendCardWithInfo } = require('../selectmenus/dateStatsSelector')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')
const { getDefaultInteractionOption } = require('../../functions/commands')

module.exports = {
  name: 'uDSG',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value

    json = { ...json, ...JSON.parse(values) }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json, CustomType.getType(interaction.component.label))
  }
}
