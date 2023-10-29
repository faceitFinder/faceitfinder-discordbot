const Discord = require('discord.js')
const { getCardByUserType } = require('../../templates/loadingCard')
const { updateDefaultOption } = require('../../functions/dateStats')
const { getMatchItems, sendCardWithInfo } = require('../../commands/last')
const { getStats } = require('../../functions/apiHandler')
const { updatePaginationComponents } = require('../../functions/pagination')

const updateEmbedMessage = async (interaction, playerId, matchId, map, game) => {
  const {
    playerDatas,
    steamDatas,
    playerHistory
  } = await getStats({
    playerParam: {
      param: playerId,
      faceitId: true
    },
    matchNumber: 0,
    map: map,
    game
  })

  return getMatchItems(interaction, playerDatas, steamDatas, playerHistory, matchId, game)
}

module.exports = {
  name: 'lastSelector',
  async execute(interaction, values, newUser = false) {
    const optionsComponents = interaction.message.components.at(0).components
    const pagination = interaction.message.components.at(1)
    // Cheking if the interaction is from the find command
    const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

    getCardByUserType(newUser, interaction)

    if (newUser) {
      return sendCardWithInfo(
        interaction,
        { param: values.playerId, faceitId: true },
        values.matchId,
        values.currentPage,
        values.map,
        'lastSelector',
        'pageLast',
        values.maxMatch,
        values.game
      )
    }

    updatePaginationComponents(pagination.components, values)

    const components = [
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('lastSelector')
            .addOptions(updateDefaultOption(optionsComponents, interaction.values[0], false))),
      pagination
    ]

    const messageItems = await updateEmbedMessage(interaction, values.playerId, values.matchId, values.map, values.game)
    if (playerStatsCard) messageItems.embeds.unshift(playerStatsCard)

    return {
      ...messageItems,
      components
    }
  }
}