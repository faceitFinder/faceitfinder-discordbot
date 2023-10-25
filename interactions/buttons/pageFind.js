const CommandsStats = require('../../database/commandsStats')
const { loadingCard } = require('../../templates/loadingCard')
const Last = require('../../commands/last')

module.exports = {
  name: 'pageFind',
  async execute(interaction, json) {
    const players = interaction.message.components.at(3)
    const excludedPlayers = interaction.message.components.at(4)
    const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

    CommandsStats.create('find', `button - ${json.t.name}`, interaction)

    loadingCard(interaction)

    const {
      embeds,
      components,
      files
    } = await Last.sendCardWithInfo(interaction, {
      param: json.s,
      faceitId: true
    }, null, json.page, json.m, 'findSelector', 'pageFind', json.l)

    if (playerStatsCard) embeds.unshift(playerStatsCard)
    if (players) components.push(players)
    if (excludedPlayers) components.push(excludedPlayers)

    return {
      embeds,
      components,
      files
    }
  },
  getJSON(interaction, json) {
    const values = interaction.message.components.at(0).components.at(0).options.at(0).value
    const maxMatch = interaction.message.components.at(3)?.components.at(0).customId
    if (maxMatch) json.l = JSON.parse(maxMatch).l

    return { ...json, ...JSON.parse(values) }
  },
}
