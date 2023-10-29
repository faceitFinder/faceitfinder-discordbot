const { ActionRowBuilder } = require('discord.js')
const { buildButtons } = require('../../commands/laststats')
const CommandsStats = require('../../database/commandsStats')
const { updateButtons } = require('../../functions/customType')
const { getCardWithInfo } = require('../../functions/dateStats')
const { getCardByUserType } = require('../../templates/loadingCard')

/**
 * Update last stats graph.
 */
module.exports = {
  name: 'uLSG',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('laststats', `button - ${json.type.name}`, interaction)

    getCardByUserType(newUser, interaction)

    const resp = await getCardWithInfo({
      interaction,
      values: json,
      type: json.type,
      updateStartDate: true
    })

    if (newUser) resp.components = await buildButtons(interaction, json, json.type)
    else resp.components = [new ActionRowBuilder()
      .addComponents(updateButtons(interaction.message.components.at(0).components, json.type))]

    return resp
  }
}
