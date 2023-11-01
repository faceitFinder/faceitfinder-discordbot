const Discord = require('discord.js')
const { getCardByUserType } = require('../../templates/loadingCard')
const { getMatchItems } = require('../../commands/last')
const { getStats } = require('../../functions/apiHandler')
const Interaction = require('../../database/interaction')
const { updatePaginationComponents } = require('../../functions/pagination')
const { sendCardWithInfo } = require('../../commands/find')
const { updateDefaultOption } = require('../../functions/utility')

const updateEmbedMessage = async (interaction, playerId, matchId, game) => {
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
    game
  })

  return getMatchItems(interaction, playerDatas, steamDatas, playerHistory, matchId, game)
}

module.exports = {
  name: 'findSelector',
  async execute(interaction, values, newUser = false) {
    const optionsComponents = interaction.message.components.at(0).components
    const pagination = interaction.message.components.at(1)
    const players = interaction.message.components.at(2)
    const activePlayer = players?.components.findIndex((c) => c.data.disabled)
    const excludedPlayers = interaction.message.components.at(3)
    const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

    getCardByUserType(newUser, interaction)

    if (newUser) {
      return sendCardWithInfo(
        interaction,
        { param: values.playerId, faceitId: true },
        values.maxMatch,
        true,
        values.map,
        [],
        values.includedPlayers,
        [],
        values.excludedPlayers,
        values.game,
        values.currentPage,
        values.matchId
      )
    }

    updatePaginationComponents(pagination.components, values)
    players.components.forEach((component, index) => {
      if (index !== activePlayer) component.setDisabled(false)
      Interaction.updateOne(component.data.custom_id)
    })

    const components = [
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('findSelector')
            .addOptions(updateDefaultOption(optionsComponents, interaction.values[0], false))),
      pagination
    ]

    if (players) components.push(players)
    if (excludedPlayers) components.push(excludedPlayers)

    const messageItems = await updateEmbedMessage(interaction, values.playerId, values.matchId, values.game)
    if (playerStatsCard) messageItems.embeds.unshift(playerStatsCard)

    return {
      ...messageItems,
      components
    }
  }
}