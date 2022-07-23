const { getDefaultInteractionOption } = require('../../functions/commands')
const { sendCardWithInfos } = require('../../commands/last')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value,
      u = values.slice(0, 18),
      s = values.slice(18, 54),
      m = values.slice(54, values.length)

    json = { ...json, u, m, s }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return sendCardWithInfos(interaction, json.s, null, json.page)
  }
}
