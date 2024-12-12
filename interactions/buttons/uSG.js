const { ActionRowBuilder } = require('discord.js')
const CommandsStats = require('../../database/commandsStats')
const { buildEmbed } = require('../../commands/stats')
const { getCardByUserType } = require('../../templates/loadingCard')
const { updateButtons, buildButtonsGraph } = require('../../functions/customType')

/**
 * Update stats graph.
 */
module.exports = {
  name: 'uSG',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('stats', `button - ${json.type.name}`, interaction)
    let components = interaction.message.components

    getCardByUserType(newUser, interaction)

    const {
      card,
      files,
      buttonValues,
    } = await buildEmbed({
      playerParam: {
        param: json.playerId,
        faceitId: true
      },
      game: json.game,
      type: json.type,
      locale: interaction.locale
    })

    if (newUser) {
      components = [new ActionRowBuilder().addComponents(await buildButtonsGraph(interaction, buttonValues))]
    }

    components.at(0).components = updateButtons(components.at(0).components, json.type)

    return {
      content: ' ',
      embeds: [card],
      files,
      components
    }
  }
}
