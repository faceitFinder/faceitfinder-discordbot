const DateStats = require('../functions/dateStats')
const { getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const { getTranslation, getTranslations } = require('../languages/setup')
const { getGameOption, getInteractionOption } = require('../functions/utility')
const { getMapOption } = require('../functions/map')

const getMonday = date => {
  const week = [6, 0, 1, 2, 3, 4, 5]

  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return new Date(date.setDate(date.getDate() - week[date.getDay()])).getTime()
}

const formatFromToDates = (date) => {
  const from = new Date(date.date)
  const to = new Date(from).setDate(from.getDate() + 7)

  return {
    from: from.getTime(),
    to: to
  }
}

const formatLabel = (from, to, locale) => {
  return [new Date(from).toDateString(), '-', new Date(new Date(to).setHours(-24)).toDateString()].join(' ')
}

const sendCardWithInfo = async (interaction, playerParam, page = 0, game = null, type = null, defaultOption = 0, map = null) => {
  game ??= getGameOption(interaction)
  map ??= getInteractionOption(interaction, 'map') ?? ''

  return DateStats.generateDatasForCard({
    interaction,
    playerParam,
    page,
    game,
    functionToGetDates: getMonday,
    formatFromToDates,
    formatLabel,
    selectTranslationString: 'strings.selectWeek',
    type,
    defaultOption,
    map
  })
}

module.exports = {
  name: 'weekstats',
  options: [
    ...Options.stats,
    getMapOption()
  ],
  description: getTranslation('command.weekstats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.weekstats.description'),
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
