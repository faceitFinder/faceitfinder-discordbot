const { sendCardWithInfo } = require('../../commands/find')
const CommandsStats = require('../../database/commandsStats')
const { getOptionsValues } = require('../../functions/commands')
const { loadingCard } = require('../../templates/loadingCard')

/**
 * Find user stats graph.
 */
module.exports = {
  name: 'fUSG',
  async execute(interaction, json) {
    CommandsStats.create('find', 'button - player', interaction)

    const players = interaction.message.components.at(3)?.components.map(p => JSON.parse(p.customId).s).filter(e => e !== json.s) || []
    const excludedPlayers = interaction.message.components.at(4)?.components.map(p => p.customId) || []

    loadingCard(interaction)

    return sendCardWithInfo(interaction, {
      param: json.s,
      faceitId: true
    }, json.l, 1, json.m, [], players, [], excludedPlayers, json.g)
  },
  getJSON(interaction, json) {
    const values = getOptionsValues(interaction)
    values.s = json.s
    values.l = json.l
    return values
  },
}