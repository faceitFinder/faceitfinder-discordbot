const Discord = require('discord.js')
const { maxMatchsDateStats } = require('../config.json')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')

const getDay = date => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const sendCardWithInfos = async (interaction, playerId) => {
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, maxMatchsDateStats, getDay)
  let first = false

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date).setHours(24)

    let option = {
      label: from.toDateString(),
      description: `${date.number} match played`,
      value: JSON.stringify({
        s: playerId,
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
        .setPlaceholder('Select a day')
        .addOptions(options.slice(0, 24)))

  return DateStats.getCardWithInfos(row, JSON.parse(options[0].value), CustomType.TYPES.ELO)
}

module.exports = {
  name: 'dailystats',
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
  description: 'Displays the stats of the choosen day. With elo graph of the day.',
  usage: 'steam_parameters:multiple steam params and @user or CSGO status (max 10 users) OR team:team slug (max 1) OR faceit_parameters:multiple faceit nicknames (max 10)',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
