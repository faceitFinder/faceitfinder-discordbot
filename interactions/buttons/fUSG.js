const { sendCardWithInfo } = require('../../commands/last')
const CommandsStats = require('../../database/commandsStats')
const { updateMessage } = require('../../events/interactionCreate')
const loadingCard = require('../../templates/loadingCard')

/**
 * Find user stats graph.
 */
module.exports = {
  name: 'fUSG',
  async execute(interaction, json) {
    CommandsStats.create('find', 'button - player', interaction)

    const players = interaction.message.components.at(3)?.components.map(p => JSON.parse(p.customId).s) || []
    const excludedPlayers = interaction.message.components.at(4)?.components.map(p => p.customId) || []

    loadingCard(interaction)

    return sendCardWithInfo(interaction, json.s, null, json.page, players, json.m, excludedPlayers)
  },
  getJSON(interaction, json) {
    const values = interaction.message.components.at(0).components.at(0).options.at(0).value
    return { ...json, ...JSON.parse(values) }
  },
}