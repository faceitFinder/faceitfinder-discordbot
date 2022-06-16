const Discord = require('discord.js')
const { getInteractionOption, getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const DateStats = require('../functions/dateStats')
const CustomType = require('../templates/customType')
const Match = require('../functions/match')

const sendCardWithInfos = async (interaction, playerId, type = CustomType.TYPES.ELO) => {
  const maxMatch = getInteractionOption(interaction, 'match_number') || 20
  const playerHistory = await Match.getMatchElo(playerId, maxMatch)
  const lastMatch = playerHistory.pop()

  const option = {
    label: 'Last stats',
    description: `${lastMatch.number} match played`,
    value: JSON.stringify({
      s: playerId,
      f: lastMatch.date / 1000,
      m: maxMatch,
      u: interaction.user.id
    }),
    default: true
  }

  const row = new Discord.MessageActionRow()
    .addComponents(new Discord.MessageSelectMenu()
      .setCustomId('lastStatsSelector')
      .addOptions([option])
      .setDisabled(true))

  return DateStats.getCardWithInfos(row, JSON.parse(option.value), type, maxMatch, 'uLSG')
}

const getOptions = () => {
  const options = [...Options.stats]
  options.unshift({
    name: 'match_number',
    description: 'Number of matchs to display. Default: 20, max: 2000',
    required: false,
    type: 4,
    slash: true,
  })

  return options
}

module.exports = {
  name: 'laststats',
  options: getOptions(),
  description: 'Displays the stats of the x last match. With elo graph of the x last match.',
  usage: 'match_number:number of matchs to display AND steam_parameters:multiple steam params and @user or CSGO status (max 10 users) OR team:team slug (max 1) OR faceit_parameters:multiple faceit nicknames (max 10)',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos).catch(console.error)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos