const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const { updateDefaultOption } = require('../../functions/dateStats')
const { getMatchItems } = require('../../commands/last')
const { getStats } = require('../../functions/apiHandler')
const { getOptionsValues } = require('../../functions/commands')

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
  async execute(interaction, values) {
    try {
      const optionsComponents = interaction.message.components.at(1).components
      const paginationComponents = interaction.message.components.at(2)
      const playerComponents = interaction.message.components.at(3)
      const excludedPlayerComponents = interaction.message.components.at(4)
      const playerStatsCard = interaction.message.embeds.filter(e => e.data.image.url.includes('graph'))?.at(0)

      loadingCard(interaction)

      const components = [
        values.dataRow,
        new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.StringSelectMenuBuilder()
              .setCustomId('findSelector')
              .addOptions(updateDefaultOption(optionsComponents, values.m, false))),
        paginationComponents
      ]

      if (playerComponents) components.push(playerComponents)
      if (excludedPlayerComponents) components.push(excludedPlayerComponents)

      const messageItems = await updateEmbedMessage(interaction, values.s, values.m, values.g)
      if (playerStatsCard) messageItems.embeds.unshift(playerStatsCard)

      return {
        ...messageItems,
        components: components
      }
    } catch (error) {
      console.error(error)
    }
  },
  getJSON(interaction, json) {
    const dataRow = interaction.message.components.at(0)
    const value = getOptionsValues(interaction)
    const m = interaction.values.at(0)

    return Object.assign({}, value, { m, dataRow })
  },
  updateUser(interaction) {
    const values = this.getJSON(interaction)
    const dataRowValues = JSON.parse(values.dataRow.components.at(0).options.at(0).value)
    dataRowValues.u = interaction.user.id
    values.dataRow.components.at(0).options.at(0).value = JSON.stringify(dataRowValues)

    return values
  }
}