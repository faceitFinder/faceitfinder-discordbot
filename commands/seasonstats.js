const Discord = require('discord.js')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getInteractionOption, generateOption, setOptionDefault } = require('../functions/utility')
const { getMapOption } = require('../functions/map')
const { getSeasons, getStats } = require('../functions/apiHandler')
const { getMaxPage, getPagination, getPageSlice } = require('../functions/pagination')
const { currentSeason } = require('../config.json')

const statsOptions = Options.stats.filter(option => option.name !== 'game')

const sendCardWithInfo = async (
  interaction, playerParam, page = 0, type = null, defaultOption = null, map = null
) => {
  const game = 'cs2'

  map ??= getInteractionOption(interaction, 'map') ?? ''
  type ??= CustomType.TYPES.ELO

  const {
    playerDatas,
    playerHistory
  } = await getStats({
    playerParam,
    matchNumber: 0,
    game,
    map
  })

  if (!playerHistory.length) throw getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  })

  const { payload } = await getSeasons(game)
  const seasons = payload.cs2.seasons
  const playerId = playerDatas.player_id
  const optionsValues = []

  for (const season of seasons.sort((a, b) => b.number - a.number)) {
    const from = new Date(season.from).getTime()
    const to = new Date(season.to)?.getTime() || new Date().setDate(+24)

    optionsValues.push({
      label: `Season ${season.number}`,
      description: `${new Date(from).toLocaleDateString('en-EN')} - ${new Date(to).toLocaleDateString('en-EN')}`,
      values: {
        playerId,
        from,
        to,
        game,
        maxMatch: 0,
        map,
        type,
        seasonNumber: season.number
      }
    })
  }

  if (!optionsValues.length) throw getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  })

  if (defaultOption === null) {
    defaultOption = optionsValues.findIndex(option => option.values.seasonNumber === currentSeason)
    if (defaultOption === -1) defaultOption = optionsValues.length - 1
  }

  const maxPage = getMaxPage(optionsValues)
  optionsValues.forEach(option => {
    option.values.maxPage = maxPage
    option.values.currentPage = page
  })

  const pages = getPageSlice(page)
  const paginationOptionsRaw = optionsValues.slice(pages.start, pages.end)
  const values = paginationOptionsRaw[defaultOption].values
  const pagination = await Promise.all(paginationOptionsRaw.map(option => generateOption(interaction, option)))

  pagination[defaultOption] = setOptionDefault(pagination.at(defaultOption))

  const resp = await DateStats.getCardWithInfo({
    interaction,
    values,
    type
  })

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('dateStatsSelector')
          .setPlaceholder(getTranslation('strings.selectSeason', interaction.locale))
          .addOptions(pagination)),
    new Discord.ActionRowBuilder()
      .addComponents(await CustomTypeFunc.buildButtonsGraph(interaction, Object.assign({}, values, {
        id: 'uDSG',
        maxPage,
        currentPage: page
      }), type))
  ]

  if (page !== null) components.push(await getPagination(interaction, page, maxPage, 'pageDS', values))

  resp.components = components

  return resp
}

module.exports = {
  name: 'seasonstats',
  options: [
    ...statsOptions,
    getMapOption()
  ],
  description: getTranslation('command.seasonstats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.seasonstats.description'),
  usage: `${Options.usage} <map>`,
  example: 'steam_parameters: justdams',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions({
      interaction,
      fn: sendCardWithInfo
    })
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
