const Discord = require('discord.js')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')
const { getPageSlice, getMaxPage } = require('../functions/pagination')

const getFirstDay = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  a.setDate(1)
  return a.getTime()
}

const sendCardWithInfo = async (interaction, playerId, page = 0) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, playerStats.lifetime.Matches, getFirstDay)

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date).setMonth(new Date(date.date).getMonth() + 1)

    let option = new Discord.StringSelectMenuOptionBuilder()
      .setLabel(`${from.toLocaleDateString('en-EN', { month: 'short', year: 'numeric' })}`)
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
      new Discord.StringSelectMenuBuilder()
        .setCustomId('dateStatsSelector')
        .setPlaceholder('Select a month')
        .addOptions(pagination))

  return DateStats.getCardWithInfo(row,
    JSON.parse(pagination[0].data.value),
    CustomType.TYPES.ELO,
    'uDSG',
    playerStats.lifetime.Matches,
    getMaxPage(options),
    page)
}

module.exports = {
  name: 'monthstats',
  options: Options.stats,
  description: 'Displays the stats of the choosen month. With elo graph of the month.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
