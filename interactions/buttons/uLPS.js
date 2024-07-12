const { ActionRowBuilder } = require('discord.js')
const CommandsStats = require('../../database/commandsStats')
const { updateButtons } = require('../../functions/customType')
const { sendCardWithInfo, getMatchItems } = require('../../commands/last')
const { getCardByUserType } = require('../../templates/loadingCard')
const { getStats } = require('../../functions/apiHandler')

/**
 * Update last stats graph.
 */
module.exports = {
  name: 'uLPS',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('last', 'button - player', interaction)
    const componentsLength = interaction.message.components.length
    // get the 2 last components
    const components = interaction.message.components.slice(componentsLength - 2, componentsLength)

    getCardByUserType(newUser, interaction)

    const {
      playerDatas,
      steamDatas
    } = await getStats({
      playerParam: { id: json.type.playerId },
      matchNumber: 1,
      checkElo: 0,
    })

    const matchItems = await getMatchItems(interaction, playerDatas, steamDatas, json.selectedMatchStats, json.matchId, json.game)
    const buttons = await updateButtons(components, json.type)

    return {
      ...matchItems,
      components: [
        new ActionRowBuilder().addComponents(buttons)
      ]
    }
  }
}
