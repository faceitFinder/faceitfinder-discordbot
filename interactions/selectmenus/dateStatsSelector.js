const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const CustomType = require('../../templates/customType')
const DateStats = require('../../functions/dateStats')

const sendCardWithInfo = async (interaction, values, type = CustomType.TYPES.ELO) => {
  const lastItemPaginationValues = JSON.parse(interaction.message.components.at(2).components.at(3).customId)
  const options = DateStats.updateOptions(interaction.message.components.at(0).components, JSON.stringify(values))

  const actionRow = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId('dateStatsSelector')
        .addOptions(options))

  loadingCard(interaction)

  return DateStats.getCardWithInfo(interaction,
    actionRow,
    values,
    type,
    'uDSG',
    null,
    lastItemPaginationValues.page,
    lastItemPaginationValues.c
  )
}

module.exports = {
  name: 'dateStatsSelector',
  async execute(interaction, json) {
    return sendCardWithInfo(interaction, json)
  },
  sendCardWithInfo,
  getJSON(interaction, json) {
    return JSON.parse(interaction.values.at(0))
  }
}