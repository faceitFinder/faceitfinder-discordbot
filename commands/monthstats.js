const Discord = require('discord.js')
const { maxMatchsDateStats } = require('../config.json')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')

const getFirstDay = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  a.setDate(1)
  return a.getTime()
}

const sendCardWithInfos = async (interaction, playerId) => {
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
        .setPlaceholder('Select a month')
        .addOptions(options.slice(0, 25)))

  return DateStats.getCardWithInfos(row, JSON.parse(options[0].value), CustomType.TYPES.ELO, maxMatchsDateStats, 'uDSG')
}

module.exports = {
  name: 'monthstats',
  options: Options.stats,
  description: 'Displays the stats of the choosen month. With elo graph of the month.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
