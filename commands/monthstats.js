const DateStats = require('../functions/dateStats')
const { getCardsConditions, getGameOption } = require('../functions/commands')
const Options = require('../templates/options')
const { getTranslations, getTranslation } = require('../languages/setup')

const getFirstDay = (x) => {
  const a = new Date(x)
  a.setHours(0, 0, 0, 0)
  a.setDate(1)
  return a.getTime()
}

const formatFromToDates = (date) => {
  const from = new Date(date.date)
  const to = new Date(date.date).setMonth(new Date(date.date).getMonth() + 1)

  return {
    from: from.getTime(),
    to: to
  }
}

const formatLabel = (from, to, locale) => {
  return new Date(from).toLocaleDateString('en-EN', { month: 'short', year: 'numeric' })
}

const sendCardWithInfo = async (interaction, playerParam, page = 0, game = null, type = null) => {
  game ??= getGameOption(interaction)

  return DateStats.generateDatasForCard({
    interaction,
    playerParam,
    page,
    game,
    functionToGetDates: getFirstDay,
    formatFromToDates,
    formatLabel,
    selectTranslationString: 'strings.selectMonth',
    type
  })
}

module.exports = {
  name: 'monthstats',
  options: Options.stats,
  description: getTranslation('command.monthstats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.monthstats.description'),
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions({
      interaction,
      fn: sendCardWithInfo
    })
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
