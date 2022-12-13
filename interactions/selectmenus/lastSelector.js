const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const { updateOptions, getPlayerHistory } = require('../../functions/dateStats')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const { getMatchItems } = require('../../commands/last')

const updateEmbedMessage = async (playerId, matchId, page) => {
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerId)
  const playerHistory = await getPlayerHistory(playerId, null)

  return getMatchItems(playerDatas, steamDatas, playerHistory, playerHistory.length, page, matchId)
}

module.exports = {
  name: 'lastSelector',
  async execute(interaction) {
    const dataRow = interaction.message.components.at(0)
    const value = JSON.parse(dataRow.components.at(0).options.at(0).value)
    const m = interaction.values.at(0)
    const json = { ...value, m }

    if (json.u !== interaction.user.id) return

    const optionsComponents = interaction.message.components.at(1).components
    const paginationComponents = interaction.message.components.at(2)
    const playerComponents = interaction.message.components.at(3)
    const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

    const currentPage = JSON.parse(paginationComponents.components.at(0).customId).c

    loadingCard(interaction)

    const components = [
      dataRow,
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('lastSelector')
            .addOptions(updateOptions(optionsComponents, m, false))),
      paginationComponents
    ]

    if (playerComponents !== undefined) components.push(playerComponents)

    const messageItems = await updateEmbedMessage(json.s, json.m, currentPage)
    if (playerStatsCard) messageItems.embeds.unshift(playerStatsCard)

    return {
      ...messageItems,
      components: components
    }
  }
}