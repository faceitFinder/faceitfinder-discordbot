const Discord = require('discord.js')
const { getInteractionOption, getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const DateStats = require('../functions/dateStats')
const CustomType = require('../templates/customType')
const { getMapChoice } = require('../functions/map')

const sendCardWithInfos = async (interaction, playerId, type = CustomType.TYPES.ELO) => {
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
    .addComponents(new Discord.SelectMenuBuilder()
      .setCustomId('lastStatsSelector')
      .addOptions([option])
      .setDisabled(true))

  return DateStats.getCardWithInfos(row, JSON.parse(option.value), type, 'uLSG', maxMatch, null, null, map)
}

const getOptions = () => {
  const options = [...Options.stats]
  options.unshift({
    name: 'match_number',
    description: 'Number of matchs to display. Default: 20',
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
  })

  return options
}

module.exports = {
  name: 'laststats',
  options: getOptions(),
  description: 'Displays the stats of the x last match. With elo graph of the x last match.',
  usage: `match_number:number of matchs to display AND ${Options.usage}`,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos