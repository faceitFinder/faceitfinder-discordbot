const { StringSelectMenuOptionBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const errorCard = require('../templates/errorCard')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const CustomType = require('../templates/customType')
const Options = require('../templates/options')
const { getPageSlice, getMaxPage } = require('../functions/pagination')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')

const getDay = date => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
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
  const dates = await DateStats.getDates(playerHistory, getDay)

  dates.forEach(date => {
    const from = new Date(date.date)
    const to = new Date(date.date).setHours(24)

    let option = new StringSelectMenuOptionBuilder()
      .setLabel(from.toDateString())
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

  const row = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('dateStatsSelector')
        .setPlaceholder(getTranslation('strings.selectDate', interaction.locale))
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
  name: 'dailystats',
  options: Options.stats,
  description: getTranslation('command.dailystats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.dailystats.description'),
  usage: Options.usage,
  example: 'steam_parameters: justdams',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
