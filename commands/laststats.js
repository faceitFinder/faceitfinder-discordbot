const Discord = require('discord.js')
const { getInteractionOption, getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const DateStats = require('../functions/dateStats')
const CustomType = require('../templates/customType')

const sendCardWithInfos = async (interaction, playerId, type = CustomType.TYPES.ELO) => {
  const maxMatch = getInteractionOption(interaction, 'match_number') || 20
  const playerHistory = await DateStats.getPlayerHistory(playerId, maxMatch)
  const lastMatch = playerHistory.pop()

  const option = {
    label: 'Last stats',
    description: `${playerHistory.length} match played`,
    value: JSON.stringify({
      s: playerId,
      f: lastMatch.date / 1000,
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

  return DateStats.getCardWithInfos(row, JSON.parse(option.value), type, 'uLSG', maxMatch)
}

const getOptions = () => {
  const options = [...Options.stats]
  options.unshift({
    name: 'match_number',
    description: 'Number of matchs to display. Default: 20',
    required: false,
    type: Discord.ApplicationCommandOptionType.Integer,
    slash: true,
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