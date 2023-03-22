const { ApplicationCommandOptionType } = require('discord.js')
const { getTranslations, getTranslation } = require('../languages/setup')

const stats = [
  {
    name: 'steam_parameters',
    description: getTranslation('options.steamParameters', 'en-US'),
    descriptionLocalizations: getTranslations('options.steamParameters'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  },
  {
    name: 'team',
    description: getTranslation('options.teamParameter', 'en-US'),
    descriptionLocalizations: getTranslations('options.teamParameter'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  },
  {
    name: 'faceit_parameters',
    description: getTranslation('options.faceitParameters', 'en-US'),
    descriptionLocalizations: getTranslations('options.faceitParameters'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }
]

const dateRange = [
  {
    name: 'from_date',
    description: getTranslation('options.fromDate', 'en-US'),
    descriptionLocalizations: getTranslations('options.fromDate'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  },
  {
    name: 'to_date',
    description: getTranslation('options.toDate', 'en-US'),
    descriptionLocalizations: getTranslations('options.toDate'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }
]

const usage = '{<steam_parameters> <faceit_parameters> <team>}'
const dateRangeUsage = '<from_date> <to_date>'

module.exports = {
  stats,
  usage,
  dateRange,
  dateRangeUsage
}