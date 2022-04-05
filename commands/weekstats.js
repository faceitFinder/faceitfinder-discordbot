const Discord = require('discord.js')
const { emojis, maxMatchsDateStats } = require('../config.json')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')

const getMonday = date => {
  const week = [6, 0, 1, 2, 3, 4, 5]

  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return new Date(date.setDate(date.getDate() - week[date.getDay()])).getTime()
}

const sendCardWithInfos = async (message, steamParam) => {
  const steamId = await Steam.getId(steamParam)
  const playerId = await Player.getId(steamId)
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, maxMatchsDateStats, getMonday)
  let first = false

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(from.setDate(from.getDate() + 7))

    let option = {
      label: [new Date(date.date).toDateString(), '-', new Date(new Date(to).setHours(-24)).toDateString()].join(' '),
      description: `${date.number} match played`,
      value: JSON.stringify({
        s: steamId,
        f: date.date / 1000,
        t: to.getTime() / 1000,
        u: message.author.id
      })
    }

    if (!first) {
      first = true
      option = DateStats.setOption(option, true)
    } options.push(option)
  })


  if (options.length === 0) return errorCard(`Couldn\'t get matchs of ${playerStats.nickname}`)
  if (playerStats.lifetime.Matches > maxMatchsDateStats) options.pop()
  const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('dateStatsSelector')
        .setPlaceholder('Select a week')
        .addOptions(options.slice(0, 24)))

  return DateStats.getCardWithInfos(row, JSON.parse(options[0].value), CustomType.TYPES.ELO)
}

module.exports = {
  name: 'weekstats',
  aliasses: ['weekstats', 'ws'],
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
  description: 'Displays the stats of the choosen week. With elo graph of the week.',
  usage: 'multiple steam params and @user or CSGO status, max 10 users',
  type: 'stats',
  async execute(message, args) {
    return getCardsConditions(message, args, sendCardWithInfos)
  }
}
