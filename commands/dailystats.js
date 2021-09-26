const Discord = require('discord.js')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)

    const options = []
    const dates = []
    const maxMatch = 85

    const playerHistory = await Player.getHistory(playerId, maxMatch)

    for (const e of playerHistory.items) {
      const matchDate = new Date(e.started_at * 1000).setHours(0, 0, 0, 0)
      dates.filter(e => e === matchDate).length > 0 ? null : dates.push(matchDate)
    }

    dates.sort().reverse().every((d, k) => {
      if (k <= 24) {
        options.push({
          label: new Date(d).toDateString(),
          value: JSON.stringify({
            steamId: steamId,
            date: parseInt(d.toString().slice(0, -3)),
            userId: message.author.id,
            maxMatch: maxMatch
          })
        })
        return true
      } else return false
    })

    if (options.length === 0) return errorCard(`Couldn\'t get today matches of ${playerDatas.nickname}`)
    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('dailyStatsSelector')
          .setPlaceholder('No dates selected')
          .addOptions(options))

    return {
      content: `Select one of the following dates to get the stats related (${playerDatas.nickname})`,
      components: [row]
    }
  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'dailystats',
  aliasses: ['dailystats', 'ds'],
  options: [
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6
    }
  ],
  description: "Displays the stats of the current day of the user(s) given, including a graph that show the elo evolution.",
  slashDescription: "Displays your stats of the current day, including a graph that show your elo evolution.",
  usage: '',
  type: 'stats',
  async execute(message, args) {
    const params = []
    await args.forEach(async e => { params.push(e.split('/').filter(e => e).pop()) })

    return await getCardsConditions(message.mentions.users, [], params, message, sendCardWithInfos)
  }
}