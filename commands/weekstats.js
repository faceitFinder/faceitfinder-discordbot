const { itemByPage } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')
const { getPageSlice } = require('../functions/pagination')

const getMonday = date => {
  const week = [6, 0, 1, 2, 3, 4, 5]

  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return new Date(date.setDate(date.getDate() - week[date.getDay()])).getTime()
}

const sendCardWithInfos = async (interaction, playerId, page = 0) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)

  const options = []
  const dates = await DateStats.getDates(playerId, playerStats.lifetime.Matches, getMonday)

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(from.setDate(from.getDate() + 7))

    let option = new Discord.SelectMenuOptionBuilder()
      .setLabel([new Date(date.date).toDateString(), '-', new Date(new Date(to).setHours(-24)).toDateString()].join(' '))
      .setDescription(`${date.number} match played`)
      .setValue(JSON.stringify({
        s: playerId,
        f: date.date / 1000,
        t: to.getTime() / 1000,
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
        .setPlaceholder('Select a week')
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
  name: 'weekstats',
  options: Options.stats,
  description: 'Displays the stats of the choosen week. With elo graph of the week.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
