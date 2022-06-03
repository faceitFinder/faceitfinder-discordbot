const Discord = require('discord.js')
const Player = require('../functions/player')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (interaction, playerId) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []

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
      value: JSON.stringify(values)
    })
  })

  const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('mapSelector')
        .setPlaceholder('Select a map')
        .addOptions(options),
    )

  return {
    content: `Select one of the following maps to get the stats related (${playerDatas.nickname})`,
    components: [row]
  }
}

module.exports = {
  name: 'map',
  options: [
    {
      name: 'steam_parameters',
      description: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'team',
      description: 'team slug (you need to be a part of it, the creator, or it has to be public)',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'faceit_parameters',
      description: 'faceit nicknames (case sensitive)',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: 'Displays the stats of the choosen map.',
  usage: 'steam_parameters:multiple steam params and @user or CSGO status (max 10 users) OR team:team slug (max 1) OR faceit_parameters:multiple faceit nicknames (max 10)',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}