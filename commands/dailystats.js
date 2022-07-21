const { itemByPage } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')
const { getPageSlice } = require('../functions/pagination')

const getDay = date => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const sendCardWithInfos = async (interaction, playerId, page = 0) => {
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, playerStats.lifetime.Matches, getDay)

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date).setHours(24)

    let option = new Discord.SelectMenuOptionBuilder()
      .setLabel(from.toDateString())
      .setDescription(`${date.number} match played`)
      .setValue(JSON.stringify({
        s: playerId,
        f: from.getTime() / 1000,
        t: to / 1000,
        u: interaction.user.id
      }))

    options.push(option)
  })

  const pages = getPageSlice(page)
  const pagination = options.slice(pages.start, pages.end)

  if (pagination.length === 0) return errorCard(`Couldn't get matchs of ${playerDatas.nickname}`)

  pagination[0] = DateStats.setOptionDefault(pagination.at(0))

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId('dateStatsSelector')
        .setPlaceholder('Select a day')
        .addOptions(pagination))

  return DateStats.getCardWithInfos(row,
    JSON.parse(pagination[0].data.value),
    CustomType.TYPES.ELO,
    'uDSG',
    playerStats.lifetime.Matches,
    Math.floor(options.length / itemByPage),
    page)
}

module.exports = {
  name: 'dailystats',
  options: Options.stats,
  description: 'Displays the stats of the choosen day. With elo graph of the day.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
