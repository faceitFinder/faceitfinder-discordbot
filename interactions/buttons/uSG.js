const { ActionRowBuilder } = require('discord.js')
const CommandsStats = require('../../database/commandsStats')
const Stats = require('../../commands/stats')
const { loadingCard, updateCard } = require('../../templates/loadingCard')
const CustomType = require('../../templates/customType')
const CustomTypeFunc = require('../../functions/customType')
const { updateButtons } = require('../../functions/customType')

/**
 * Update stats graph.
 */
module.exports = {
  name: 'uSG',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('stats', `button - ${json.t.name}`, interaction)
    let components = interaction.message.components

    newUser ? loadingCard(interaction) : updateCard(interaction)

    const {
      card,
      files,
      buttonValues,
    } = await Stats.buildEmbed({
      playerParam: {
        param: json.s,
        faceitId: true
      },
      game: json.g,
      type: json.t,
      locale: interaction.locale
    })

    if (newUser) {
      const buttons = await Promise.all([CustomType.TYPES.KD, CustomType.TYPES.ELO, CustomType.TYPES.ELO_KD]
        .map((t) => CustomTypeFunc.generateButtons(interaction, buttonValues, t)))
      components = [new ActionRowBuilder().addComponents(buttons)]
    }

    components.at(0).components = updateButtons(components.at(0).components, json.t)

    return {
      content: ' ',
      embeds: [card],
      files,
      components
    }
  }
}
