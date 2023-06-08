const { emojis } = require('../config.json')
const Discord = require('discord.js')
const Options = require('../templates/options')
const { getCardsConditions, getInteractionOption } = require('../functions/commands')
const mapSelector = require('../interactions/selectmenus/mapSelector')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')

const sendCardWithInfo = async (interaction, playerParam) => {
  const options = []
  const map = getInteractionOption(interaction, 'map')

  const {
    playerDatas,
    playerStats,
  } = await getStats({
    playerParam,
    matchNumber: 1
  })

  const playerId = playerDatas.player_id

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
        .setDescription(
          getTranslation(
            'strings.matchPlayed',
            interaction.locale, { matchNumber: `${e.stats.Matches} (${e.stats['Win Rate %']}%)` }
          )
        )
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
        .setPlaceholder(getTranslation('strings.selectMap', interaction.locale))
        .addOptions(options.slice(0, 25)),
    )

  return {
    ...await mapSelector.sendCardWithInfo(interaction, playerId, map, '5v5'),
    content: map ? ' ' : getTranslation('strings.selectMapDescription', interaction.locale, { playerName: playerDatas.nickname }),
    components: [row]
  }
}

const getOptions = () => {
  const options = structuredClone(Options.stats)
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