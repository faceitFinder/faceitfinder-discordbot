const { sendCardWithInfos } = require('../selectmenus/dateStatsSelector')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'uDSG',
  async execute(interaction, json) {
    if (interaction.user.id !== json.u) return false

    loadingCard(interaction)

    return await sendCardWithInfos(interaction, json, CustomType.getType(interaction.component.label))
  }
}
