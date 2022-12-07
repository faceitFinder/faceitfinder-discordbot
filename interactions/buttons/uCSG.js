const { getDefaultInteractionOption } = require('../../functions/commands')
const { sendCardWithInfo } = require('../../commands/compare')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'uCSG',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    const matchDatas = getDefaultInteractionOption(interaction, 0, 0, 1, false).value

    json = { ...json, ...JSON.parse(values), ...JSON.parse(matchDatas) }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json.p1, json.p2, CustomType.getType(interaction.component.label), json.m, json.c)
  }
}
