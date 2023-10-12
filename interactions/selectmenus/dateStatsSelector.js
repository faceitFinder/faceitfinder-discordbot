const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const CustomType = require('../../templates/customType')
const DateStats = require('../../functions/dateStats')
const { getOptionsValues } = require('../../functions/commands')

const sendCardWithInfo = async (interaction, values, type = CustomType.TYPES.ELO) => {
  const lastItemPaginationValues = JSON.parse(interaction.message.components.at(3).components.at(3).customId)
  const options = DateStats.updateOptions(interaction.message.components.at(1).components, values)

  const actionRow = [
    values.dataRow,
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('dateStatsSelector')
          .addOptions(options))
  ]

  loadingCard(interaction)

  return DateStats.getCardWithInfo(
    interaction,
    actionRow,
    values,
    type,
    'uDSG',
    0,
    lastItemPaginationValues.page,
    lastItemPaginationValues.c,
    null,
    false,
    values.g
  )
}

module.exports = {
  name: 'dateStatsSelector',
  async execute(interaction, json) {
    return sendCardWithInfo(interaction, json)
  },
  sendCardWithInfo,
  getJSON(interaction, json) {
    const values = getOptionsValues(interaction)
    const interactionValues = JSON.parse(interaction.values.at(0))
    const dataRow = interaction.message.components.at(0)

    return Object.assign({}, ...[values].flat(), interactionValues, { dataRow })
  },
  updateUser(interaction) {
    const values = this.getJSON(interaction)
    const dataRowValues = JSON.parse(values.dataRow.components.at(0).options.at(0).value)
    dataRowValues.u = interaction.user.id
    values.dataRow.components.at(0).options.at(0).value = JSON.stringify(dataRowValues)

    return values
  }
}