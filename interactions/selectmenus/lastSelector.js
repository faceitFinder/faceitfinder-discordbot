const { sendCardWithInfos } = require('../../commands/last')
const { getDefaultInteractionOption } = require('../../functions/commands')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'lastSelector',
  async execute(interaction) {
    const value = JSON.parse(interaction.message.components.at(0).components.at(0).options.at(0).value)
    const m = interaction.values.at(0)
    const json = { ...value, m }

    if (json.u !== interaction.user.id) return

    loadingCard(interaction)

    const firstItemPagination = interaction.message.components.at(2).components.at(0)

    return sendCardWithInfos(interaction, json.s, json.m, JSON.parse(firstItemPagination.customId).c)
  }
}