const { getDefaultInteractionOption } = require('../../functions/commands')
const { sendCardWithInfos } = require('../../commands/compare')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'uCSG',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    json = { ...json, ...JSON.parse(values) }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return sendCardWithInfos(interaction, json.p1, json.p2, CustomType.getType(interaction.component.label), json.m)
  }
}
