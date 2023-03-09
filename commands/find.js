const { ApplicationCommandOptionType } = require('discord.js')
const Options = require('../templates/options')
const { getUsers } = require('../functions/commands')
const { sendCardWithInfo } = require('./last')
const { getMapChoice } = require('../functions/map')

const getOptions = () => {
  const options = [...Options.stats]
  options.unshift({
    name: 'player_aimed',
    description: 'steam_params / faceit_params / @user / empty if linked. History of the player you want to search in.',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, {
    name: 'map',
    description: 'Specify a map to get the stats related',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true,
    choices: getMapChoice()
  }, {
    name: 'excluded_steam_parameters',
    description: 'If you want to exclude steam parameters from the search',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, {
    name: 'excluded_faceit_parameters',
    description: 'If you want to exclude faceit parameters from the search',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  })

  return options
}

module.exports = {
  name: 'find',
  options: getOptions(),
  description: 'Find the games that includes the player requested (up to 5), last 1000 games.',
  usage: `<player_aimed> AND ${Options.usage} AND map:the map you want to search AND excluded_steam_parameters:the steam parameters you want to exclude AND excluded_faceit_parameters:the faceit parameters you want to exclude`,
  type: 'stats',
  async execute(interaction) {
    const playerAimed = (await getUsers(interaction, 1, 'player_aimed', 'player_aimed', false))[0].param
    const users = (await getUsers(interaction, 5)).map(p => p.param).filter((e, i, a) => a.indexOf(e) === i)
    let excludedUsers = (await getUsers(interaction, 10, 'excluded_steam_parameters', 'excluded_faceit_parameters', false))
      .map(p => p.param).filter((e, i, a) => a.indexOf(e) === i)

    excludedUsers = excludedUsers.filter(e => e.normalize() !== playerAimed.normalize())

    if (excludedUsers.includes(playerAimed)) throw 'You can\'t exclude a player you are searching for.'
    if (excludedUsers.some(e => users.includes(e))) throw 'You can\'t exclude a player you are searching for.'

    return sendCardWithInfo(interaction, playerAimed, null, 0, users.filter(e => e.normalize() !== playerAimed.normalize()), null, excludedUsers)
  }
}