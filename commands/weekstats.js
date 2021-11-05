const Discord = require('discord.js')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const week = [6, 0, 1, 2, 3, 4, 5]

const getMonday = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  return new Date(a.setDate(a.getDate() - week[a.getDay()]))
}

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
      const monday = getMonday(e.started_at * 1000).getTime()
      if (!dates.filter(e => e === monday).length > 0) dates.push(monday)
    }

    dates.sort().reverse().every((monday, k) => {
      if (k <= 24) {
        const mondayDate = new Date(monday)
        const to = new Date(mondayDate.setDate(mondayDate.getDate() + 7))

        options.push({
          label: [new Date(monday).toDateString(), '-', new Date(to.setHours(-24)).toDateString()].join(' '),
          value: JSON.stringify({
            s: steamId,
            f: monday,
            t: to.setHours(24),
            u: message.author.id,
            m: maxMatch
          })
        })
        return true
      } else return false
    })

    if (options.length === 0) return errorCard(`Couldn\'t get today matches of ${playerDatas.nickname}`)
    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('dateStatsSelector')
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
  name: 'weekstats',
  aliasses: ['weekstats', 'ws'],
  options: [
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6,
      slash: true
    }
  ],
  description: "Displays your stats of the choosen week or the stats of the user(s) given. With elo graph of the week.",
  slashDescription: "Displays your stats of the choosen week or the stats of the @ user. With elo graph of the week.",
  usage: '',
  type: 'stats',
  async execute(message, args) {
    return await getCardsConditions(message.mentions.users, [], [], message, sendCardWithInfos)
  }
}