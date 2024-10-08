const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getGameOption, getInteractionOption } = require('../functions/utility')
const { getMapOption } = require('../functions/map')

const getDay = date => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const formatFromToDates = (date, locale) => {
  const from = new Date(date.date)
  const to = new Date(date.date).setHours(24)

  return {
    from: from.getTime(),
    to: to
  }
}

const formatLabel = (from, to) => {
  return new Date(from).toDateString()
}

const sendCardWithInfo = async (interaction, playerParam, page = 0, game = null, type = null, defaultOption = 0, map = null) => {
  game ??= getGameOption(interaction)
  map ??= getInteractionOption(interaction, 'map') ?? ''

  return DateStats.generateDatasForCard({
    interaction,
    playerParam,
    page,
    game,
    functionToGetDates: getDay,
    formatFromToDates,
    formatLabel,
    selectTranslationString: 'strings.selectDate',
    type,
    defaultOption,
    map
  })
}

module.exports = {
  name: 'dailystats',
  options: [
    ...Options.stats,
    getMapOption()
  ],
  description: getTranslation('command.dailystats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.dailystats.description'),
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
