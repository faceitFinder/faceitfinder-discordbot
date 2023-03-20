const Discord = require('discord.js')
const { getInteractionOption, getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const DateStats = require('../functions/dateStats')
const CustomType = require('../templates/customType')
const { getMapChoice } = require('../functions/map')

const sendCardWithInfo = async (interaction, playerId, type = CustomType.TYPES.ELO) => {
  const { from, to } = DateStats.getFromTo(interaction)

  const map = getInteractionOption(interaction, 'map')
  const maxMatch = getInteractionOption(interaction, 'match_number') || 20

  const option = {
    label: 'Last stats',
    description: 'Last stats',
    value: JSON.stringify({
      s: playerId,
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

  return DateStats.getCardWithInfo(row, values, type, 'uLSG', maxMatch, null, null, map, true)
}

const getOptions = () => {
  const options = [...Options.stats]
  options.unshift({
    name: 'match_number',
    description: 'Number of matches to display. Default: 20',
    required: false,
    type: Discord.ApplicationCommandOptionType.Integer,
    slash: true,
  }, {
    name: 'map',
    description: 'Specify a map to get the stats related',
    required: false,
    type: Discord.ApplicationCommandOptionType.String,
    slash: true,
    choices: getMapChoice()
  },
  ...Options.dateRange)

  return options
}

module.exports = {
  name: 'laststats',
  options: getOptions(),
  description: 'Displays the stats of the x last match. With elo graph of the x last match.',
  usage: `${Options.usage} <match_number> <map> ${Options.dateRangeUsage}`,
  example: 'steam_parameters: justdams match_number: 1000 from_date: 01/01/2022 to_date: 01/01/2023',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo