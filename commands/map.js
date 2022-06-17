const { emojis } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Options = require('../templates/options')
const { getCardsConditions, getInteractionOption } = require('../functions/commands')
const mapSelector = require('../interactions/selectmenus/mapSelector')

const sendCardWithInfos = async (interaction, playerId) => {
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

    if (!options.filter(e => e.label === label).length > 0) options.push({
      label: label,
      description: `Games ${e.stats.Matches} (${e.stats['Win Rate %']}%)`,
      value: JSON.stringify(values),
      emoji: emojis.maps[e.label]?.balise || null,
      default: `${map} 5v5` === label
    })
  })

  const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('mapSelector')
        .setPlaceholder('Select a map')
        .addOptions(options.slice(0, 25)),
    )

  return {
    ...await mapSelector.sendCardWithInfos(playerId, map, '5v5'),
    content: map ? ' ' : `Select one of the following maps to get the stats related (${playerDatas.nickname})`,
    components: [row]
  }
}

const getMapList = () => {
  return [
    {
      name: 'Dust 2',
      value: 'de_dust2'
    },
    {
      name: 'Inferno',
      value: 'de_inferno'
    },
    {
      name: 'Mirage',
      value: 'de_mirage'
    },
    {
      name: 'Nuke',
      value: 'de_nuke'
    },
    {
      name: 'Overpass',
      value: 'de_overpass'
    },
    {
      name: 'Train',
      value: 'de_train'
    },
    {
      name: 'Vertigo',
      value: 'de_vertigo'
    },
    {
      name: 'Cache',
      value: 'de_cache'
    },
    {
      name: 'Cobblestone',
      value: 'de_cbble'
    },
    {
      name: 'Ancient',
      value: 'de_ancient'
    }
  ]
}

const getOptions = () => {
  const options = [...Options.stats]
  options.push({
    name: 'map',
    description: 'Map name',
    required: false,
    type: 3,
    slash: true,
    choices: [
      ...getMapList().map(c => {
        if (c?.name) return { name: c.name, value: c.value }
      }).filter(c => c !== undefined)
    ]
  })

  return options
}

module.exports = {
  name: 'map',
  options: getOptions(),
  description: 'Displays the stats of the choosen map.',
  usage: `map:choose a map name AND ${Options.usage}`,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}