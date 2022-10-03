const { getDefaultInteractionOption } = require('../../functions/commands')
const { getCardWithInfos } = require('../../functions/dateStats')
const CustomType = require('../../templates/customType')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'uLSG',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    json = { ...json, ...JSON.parse(values) }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    const actionRow = interaction.message.components.at(0)
    const [from, to] = interaction.message.embeds.at(0).data.fields[0].value.split('\n').map(e => new Date(e.trim()).getTime() / 1000)

    json.f = from
    json.t = to

    return getCardWithInfos(
      actionRow, json,
      CustomType.getType(interaction.component.label),
      'uLSG',
      json.m,
      null,
      null,
      json.c,
      true
    )
  }
}
