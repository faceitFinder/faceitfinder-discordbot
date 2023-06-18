const Discord = require('discord.js')
const { getInteractionOption, getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const DateStats = require('../functions/dateStats')
const CustomType = require('../templates/customType')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')

const sendCardWithInfo = async (interaction, playerParam, type = CustomType.TYPES.ELO) => {
  const { from, to } = DateStats.getFromTo(interaction)

  const map = getInteractionOption(interaction, 'map')
  const maxMatch = getInteractionOption(interaction, 'match_number') ?? 20
  const lastMatchString = getTranslation('strings.lastStatsLabel', interaction.locale)
  
  const {
    playerDatas
  } = await getStats({
    playerParam,
    matchNumber: maxMatch,
    map: map
  })

  const option = {
    label: lastMatchString,
    description: lastMatchString,
    value: JSON.stringify({
      s: playerDatas.player_id,
      c: map,
      m: maxMatch,
      u: interaction.user.id
    }),
    default: true
  }

  const row = new Discord.ActionRowBuilder()
    .addComponents(new Discord.StringSelectMenuBuilder()
      .setCustomId('lastStatsSelector')
      .addOptions([option])
      .setDisabled(true))

  let values = JSON.parse(option.value)

  if (from.toString() !== 'Invalid Date') values.f = from.getTime() / 1000
  if (to.toString() !== 'Invalid Date') values.t = to.getTime() / 1000

  return DateStats.getCardWithInfo(
    interaction,
    row,
    values,
    type,
    'uLSG',
    maxMatch,
    null,
    null,
    map,
    true
  )
}

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.unshift({
    name: 'match_number',
    description: getTranslation('options.matchNumber', 'en-US', {
      default: '20'
    }),
    descriptionLocalizations: getTranslations('options.matchNumber', {
      default: '20'
    }),
    required: false,
    type: Discord.ApplicationCommandOptionType.Integer,
    slash: true,
  }, getMapOption(), ...Options.dateRange)

  return options
}

module.exports = {
  name: 'laststats',
  options: getOptions(),
  description: getTranslation('command.laststats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.laststats.description'),
  usage: `${Options.usage} <match_number> <map> ${Options.dateRangeUsage}`,
  example: 'steam_parameters: justdams match_number: 1000 from_date: 01/01/2022 to_date: 01/01/2023',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo