const { sendCardWithInfos } = require('../../commands/last')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'lastSelector',
  async execute(interaction) {
    const values = interaction.values.at(0),
      u = values.slice(0, 18),
      m = values.slice(18, 56),
      s = values.slice(56, values.length)
    if (u !== interaction.user.id) return
    loadingCard(interaction)
    return sendCardWithInfos(interaction, s, m)
  }
}