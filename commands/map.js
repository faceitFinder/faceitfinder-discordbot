const Discord = require('discord.js')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')


const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerStats = await Player.getStats(playerId)
    const playerDatas = await Player.getDatas(playerId)

    const options = []

    playerStats.segments.forEach(e => {
      const label = `${e.label} ${e.mode}`
      const option = {
        m: e.label,
        v: e.mode,
        s: steamId,
        u: message.author.id
      }

      if (!options.filter(e => e.label === label).length > 0) options.push({
        label: label,
        value: JSON.stringify(option)
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

  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'map',
  aliasses: ['map'],
  options: [
    {
      name: 'steam_parameters',
      description: 'steamIDs / steam custom IDs / url of one or more steam profiles / CSGO status.',
      required: true,
      type: 3,
    },
    {
      name: 'user_mentions',
      description: '@users that has linked their profiles to the bot.',
      required: false,
      type: 6,
    },
    {
      name: 'parameters',
      slashDescription: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: "Displays the stats of the choosen map.",
  usage: 'multiple steam params and @user or CSGO status, max 10 users',
  type: 'stats',
  async execute(message, args) {
    return getCardsConditions(message, args, sendCardWithInfos)
  }
}