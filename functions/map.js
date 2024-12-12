const { ApplicationCommandOptionType } = require('discord.js')
const { getTranslations, getTranslation } = require('../languages/setup')

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
    },
    {
      name: 'Anubis',
      value: 'de_anubis'
    }
  ]
}

const getMapChoice = () => [
  ...getMapList().map(c => {
    if (c?.name) return { name: c.name, value: c.value }
  }).filter(c => c !== undefined)
]

const getMapOption = () => {
  return {
    name: 'map',
    description: getTranslation('options.mapName', 'en-US'),
    descriptionLocalizations: getTranslations('options.mapName'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true,
    choices: getMapChoice()
  }
}

module.exports = {
  getMapList,
  getMapChoice,
  getMapOption
}
