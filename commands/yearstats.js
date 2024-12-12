const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const { getTranslation, getTranslations } = require('../languages/setup')
const { getGameOption, getInteractionOption } = require('../functions/utility')
const { getMapOption } = require('../functions/map')

const getYear = date => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  date.setDate(1)
  date.setMonth(0)
  return date.getTime()
}

const formatFromToDates = (date) => {
  const from = new Date(date.date)
  const to = new Date(date.date)
  to.setHours(24)
  to.setMonth(12)
  to.setDate(1)

  return {
    from: from.getTime(),
    to: to
  }
}

const formatLabel = (from, to, locale) => {
  return `${getTranslation('strings.year', locale)} ${new Date(from).getFullYear()}`
}

const sendCardWithInfo = async (interaction, playerParam, page = 0, game = null, type = null, defaultOption = 0, map = null) => {
  game ??= getGameOption(interaction)
  map ??= getInteractionOption(interaction, 'map') ?? ''

  return DateStats.generateDatasForCard({
    interaction,
    playerParam,
    page,
    game,
    functionToGetDates: getYear,
    formatFromToDates,
    formatLabel,
    selectTranslationString: 'strings.selectYear',
    type,
    defaultOption,
    map
  })
}

module.exports = {
  name: 'yearstats',
  options: [
    ...Options.stats,
    getMapOption()
  ],
  description: getTranslation('command.yearstats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.yearstats.description'),
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
