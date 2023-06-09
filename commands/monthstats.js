const Discord = require('discord.js')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')
const { getPageSlice, getMaxPage } = require('../functions/pagination')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')

const getFirstDay = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  a.setDate(1)
  return a.getTime()
}

const sendCardWithInfo = async (interaction, playerParam, page = 0) => {
  const {
    playerDatas,
    playerHistory
  } = await getStats({
    playerParam,
    matchNumber: 0
  })
  
  const playerId = playerDatas.player_id
  const options = []
  const dates = await DateStats.getDates(playerHistory, getFirstDay)

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date).setMonth(new Date(date.date).getMonth() + 1)

    let option = new Discord.StringSelectMenuOptionBuilder()
      .setLabel(`${from.toLocaleDateString('en-EN', { month: 'short', year: 'numeric' })}`)
      .setDescription(getTranslation('strings.matchPlayed', interaction.locale, { matchNumber: date.number }))
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

  if (pagination.length === 0) return errorCard(getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  }), interaction.locale)

  pagination[0] = DateStats.setOptionDefault(pagination.at(0))

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId('dateStatsSelector')
        .setPlaceholder(getTranslation('strings.selectMonth', interaction.locale))
        .addOptions(pagination))

  return DateStats.getCardWithInfo(
    interaction,
    row,
    JSON.parse(pagination[0].data.value),
    CustomType.TYPES.ELO,
    'uDSG',
    0,
    getMaxPage(options),
    page
  )
}

module.exports = {
  name: 'monthstats',
  options: Options.stats,
  description: getTranslation('command.monthstats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.monthstats.description'),
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
