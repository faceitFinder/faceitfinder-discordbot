const Discord = require('discord.js')
const { maxMatchsDateStats } = require('../config.json')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')

const getFirstDay = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  a.setDate(1)
  return a.getTime()
}

const sendCardWithInfos = async (interaction, steamParam) => {
  const steamId = await Steam.getId(steamParam)
  const playerId = await Player.getId(steamId)
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, maxMatchsDateStats, getFirstDay)
  let first = false

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date).setMonth(new Date(date.date).getMonth() + 1)

    let option = {
      label: `${from.toLocaleDateString('en-EN', { month: 'short', year: 'numeric' })}`,
      description: `${date.number} match played`,
      value: JSON.stringify({
        s: steamId,
        f: from.getTime() / 1000,
        t: to / 1000,
        u: interaction.user.id
      })
    }

    if (!first) {
      first = true
      option = DateStats.setOption(option, true)
    } options.push(option)
  })

  if (options.length === 0) return errorCard(`Couldn't get matchs of ${playerDatas.nickname}`)
  if (playerStats.lifetime.Matches > maxMatchsDateStats) options.pop()
  const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('dateStatsSelector')
        .setPlaceholder('Select a month')
        .addOptions(options.slice(0, 24)))

  return DateStats.getCardWithInfos(row, JSON.parse(options[0].value), CustomType.TYPES.ELO)
}

module.exports = {
  name: 'monthstats',
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
    },
    {
      name: 'team',
      slashDescription: 'team slug (you need to be a part of it, the creator, or it has to be public)',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: 'Displays the stats of the choosen month. With elo graph of the month.',
  usage: 'multiple steam params and @user or CSGO status, max 10 users',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}