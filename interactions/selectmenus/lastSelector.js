const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const { updateOptions, getPlayerHistory } = require('../../functions/dateStats')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const { getMatchItems } = require('../../commands/last')

const updateEmbedMessage = async (interaction, playerId, matchId, page) => {
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerId)
  const playerHistory = await getPlayerHistory(playerId, null)

  return getMatchItems(interaction, playerDatas, steamDatas, playerHistory, playerHistory.length, page, matchId)
}

module.exports = {
  name: 'lastSelector',
  async execute(interaction, values) {
    const optionsComponents = interaction.message.components.at(1).components
    const paginationComponents = interaction.message.components.at(2)
    const playerComponents = interaction.message.components.at(3)
    const excludedPlayerComponents = interaction.message.components.at(4)
    const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

    const currentPage = JSON.parse(paginationComponents.components.at(0).customId).c

    loadingCard(interaction)

    const components = [
      values.dataRow,
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('lastSelector')
            .addOptions(updateOptions(optionsComponents, values.m, false))),
      paginationComponents
    ]

    if (playerComponents !== undefined) components.push(playerComponents)
    if (excludedPlayerComponents !== undefined) components.push(excludedPlayerComponents)

    const messageItems = await updateEmbedMessage(interaction, values.s, values.m, currentPage)
    if (playerStatsCard) messageItems.embeds.unshift(playerStatsCard)

    return {
      ...messageItems,
      components: components
    }
  },
  getJSON(interaction, json) {
    const dataRow = interaction.message.components.at(0)
    const value = JSON.parse(dataRow.components.at(0).options.at(0).value)
    const m = interaction.values.at(0)
    
    return { ...value, m, dataRow }
  },
  updateUser(interaction) {
    const values = this.getJSON(interaction)
    const dataRowValues = JSON.parse(values.dataRow.components.at(0).options.at(0).value)
    dataRowValues.u = interaction.user.id
    values.dataRow.components.at(0).options.at(0).value = JSON.stringify(dataRowValues)

    return values
  }
}