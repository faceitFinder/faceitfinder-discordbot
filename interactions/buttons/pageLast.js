const { getDefaultInteractionOption } = require('../../functions/commands')
const { sendCardWithInfos } = require('../../commands/last')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json) {
    const value = JSON.parse(interaction.message.components.at(0).components.at(0).options.at(0).value)

    json = { ...json, ...value }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return sendCardWithInfos(interaction, json.s, null, json.page)
  }
}
