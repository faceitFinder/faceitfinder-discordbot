const Discord = require('discord.js')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')

const getFirstDay = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  a.setDate(1)
  return a.getTime()
}

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerStats = await Player.getStats(playerId)
    const playerDatas = await Player.getDatas(playerId)

    const options = []
    const maxMatch = 300
    const dates = await DateStats.getDates(playerId, maxMatch, getFirstDay)

    dates.forEach(date => {
      const from = new Date(date.date)
      const to = new Date(date.date).setMonth(new Date(date.date).getMonth() + 1)

      options.push({
        label: `${from.toLocaleDateString('en-EN', { month: 'short', year: 'numeric' })}`,
        description: `${date.number} match played`,
        value: JSON.stringify({
          s: steamId,
          f: from.getTime(),
          t: to,
          u: message.author.id,
          m: maxMatch
        })
      })
    })

    if (options.length === 0) return errorCard(`Couldn\'t get matchs of ${playerDatas.nickname}`)
    if (playerStats.lifetime.Matches > maxMatch) options.pop()
    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('dateStatsSelector')
          .setPlaceholder('Select a month')
          .addOptions(options.slice(0, 24)))

    return {
      content: `Select one of the following month to get the stats related (${playerDatas.nickname})`,
      components: [row]
    }
  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'monthstats',
  aliasses: ['monthstats', 'ms'],
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
  description: "Displays the stats of the choosen month. With elo graph of the month.",
  usage: 'multiple steam params and @user or CSGO status, max 10 users',
  type: 'stats',
  async execute(message, args) {
    return getCardsConditions(message, args, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos