const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../../commands/find')
const { getTypePage } = require('../../functions/commandStats')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json) {
    const players = interaction.message.components.at(3)?.components.map(p => JSON.parse(p.customId).s) || []
    const excludedPlayers = interaction.message.components.at(4)?.components.map(p => p.customId) || []

    CommandsStats.create('find', `button - ${getTypePage(json)}`, interaction)

    loadingCard(interaction)

    return sendCardWithInfo(interaction, {
      param: json.s,
      faceitId: true
    }, null, json.page, json.m, json.l, players, excludedPlayers)
  },
  getJSON(interaction, json) {
    const values = interaction.message.components.at(0).components.at(0).options.at(0).value
    const maxMatch = interaction.message.components.at(3)?.components.at(0).customId
    if (maxMatch) json.l = JSON.parse(maxMatch).l

    return { ...json, ...JSON.parse(values) }
  },
}
