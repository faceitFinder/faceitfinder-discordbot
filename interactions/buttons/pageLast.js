const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../../commands/last')
const { getTypePage } = require('../../functions/commandStats')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json) {
    const value = JSON.parse(interaction.message.components.at(0).components.at(0).options.at(0).value)
    json = { ...json, ...value }

    if (interaction.user.id !== json.u) return

    const players = interaction.message.components.at(3)?.components.map(p => JSON.parse(p.customId).s) || []
    const excludedPlayers = interaction.message.components.at(4)?.components.map(p => p.customId) || []
    CommandsStats.create('last', `button - ${getTypePage(json)}`, interaction)

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json.s, null, json.page, players, json.m, excludedPlayers)
  }
}
