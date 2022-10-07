const Discord = require('discord.js')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')
const { getPageSlice, getMaxPage } = require('../functions/pagination')

const getYear = date => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  date.setDate(1)
  date.setMonth(0)
  return date.getTime()
}

const sendCardWithInfos = async (interaction, playerId, page = 0) => {
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, playerStats.lifetime.Matches, getYear)

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date)
    to.setHours(24)
    to.setMonth(12)
    to.setDate(1)

    let option = new Discord.SelectMenuOptionBuilder()
      .setLabel(`Year ${from.getFullYear()}`)
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

  if (pagination.length === 0) return errorCard(`Couldn't get matches of ${playerDatas.nickname}`)

  pagination[0] = DateStats.setOptionDefault(pagination.at(0))

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId('dateStatsSelector')
        .setPlaceholder('Select a year')
        .addOptions(pagination))

  return DateStats.getCardWithInfos(row,
    JSON.parse(pagination[0].data.value),
    CustomType.TYPES.ELO,
    'uDSG',
    playerStats.lifetime.Matches,
    getMaxPage(options),
    page)
}

module.exports = {
  name: 'yearstats',
  options: Options.stats,
  description: 'Displays the stats of the choosen year. With elo graph of the year.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
