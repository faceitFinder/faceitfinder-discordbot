const { ActionRowBuilder } = require('discord.js')
const CommandsStats = require('../../database/commandsStats')
const { buildEmbed, getInitPlayersDatas, buildButtons } = require('../../commands/compare')
const { getCardByUserType } = require('../../templates/loadingCard')
const { updateButtons } = require('../../functions/customType')

/**
 * Update compare stats graph.
 */
module.exports = {
  name: 'uCSG',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('compare', `button - ${json.type.name}`, interaction)
    let components = interaction.message.components

    getCardByUserType(newUser, interaction)

    const [player1, player2] = await getInitPlayersDatas({
      player1Param: { faceitId: true, param: json.p1 },
      player2Param: { faceitId: true, param: json.p2 },
      game: json.game,
      map: json.map,
    })

    const {
      card,
      files,
      buttonValues
    } = await buildEmbed({
      player1,
      player2,
      maxMatch: json.maxMatch,
      map: json.map,
      type: json.type,
      game: json.game,
      locale: interaction.locale,
      playerColor: json.playerColor,
    })

    if (newUser) {
      components = [new ActionRowBuilder().addComponents(await buildButtons(interaction, buttonValues))]
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
