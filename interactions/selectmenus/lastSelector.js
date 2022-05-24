const { sendCardWithInfos } = require('../../commands/last')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'lastSelector',
  async execute(interaction) {
    const { u, m, s } = JSON.parse(interaction.values)
    if (u !== interaction.user.id) return false

    loadingCard(interaction)

    return sendCardWithInfos(interaction, s, m)
  }
}