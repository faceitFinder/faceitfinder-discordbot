const { emojis } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Options = require('../templates/options')
const { getCardsConditions, getInteractionOption } = require('../functions/commands')
const mapSelector = require('../interactions/selectmenus/mapSelector')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')

const sendCardWithInfo = async (interaction, playerId) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []
  const map = getInteractionOption(interaction, 'map')

  playerStats.segments.forEach(e => {
    const label = `${e.label} ${e.mode}`
    const values = {
      l: label,
      s: playerId,
      u: interaction.user.id
    }

    if (!options.filter(e => e.data.label === label).length > 0) {
      const option = new Discord.StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setDescription(`Games ${e.stats.Matches} (${e.stats['Win Rate %']}%)`)
        .setValue(JSON.stringify(values))
        .setDefault(`${map} 5v5` === label)

      const emoji = emojis.maps[e.label]
      if (emoji) option.setEmoji(emoji.balise)

      options.push(option)
    }
  })

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId('mapSelector')
        .setPlaceholder('Select a map')
        .addOptions(options.slice(0, 25)),
    )

  return {
    ...await mapSelector.sendCardWithInfo(playerId, map, '5v5'),
    content: map ? ' ' : `Select one of the following maps to get the stats related (${playerDatas.nickname})`,
    components: [row]
  }
}

const getOptions = () => {
  const options = [...Options.stats]
  options.push(getMapOption())

  return options
}

module.exports = {
  name: 'map',
  options: getOptions(),
  description: getTranslation('command.map.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.map.description'),
  usage: `${Options.usage} <map>`,
  example: 'steam_parameters: justdams map: Vertigo',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}