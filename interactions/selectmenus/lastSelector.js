const { sendCardWithInfos } = require('../../commands/last')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'lastSelector',
  async execute(interaction) {
    const values = interaction.values.at(0),
      u = values.slice(0, 18),
      s = values.slice(18, 54),
      m = values.slice(54, values.length)

    if (u !== interaction.user.id) return

    loadingCard(interaction)

    const firstItemPagination = interaction.message.components.at(1).components.at(0)

    return sendCardWithInfos(interaction, s, m, JSON.parse(firstItemPagination.customId).c)
  }
}