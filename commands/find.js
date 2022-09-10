const { ApplicationCommandOptionType } = require('discord.js')
const Options = require('../templates/options')
const { getUsers } = require('../functions/commands')
const { sendCardWithInfos } = require('./last')

const getOptions = () => {
  const options = [...Options.stats]
  options.unshift({
    name: 'player_aimed',
    description: 'steam_params / faceit_params / @user / empty if linked.',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  })

  return options
}

module.exports = {
  name: 'find',
  options: getOptions(),
  description: 'Find all the games that includes the player requested (up to 5).',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    const playerAimed = (await getUsers(interaction, 1, 'player_aimed', 'player_aimed'))[0].param
    const users = (await getUsers(interaction, 5)).map(p => p.param)

    return sendCardWithInfos(interaction, playerAimed, null, 0, users.filter(e => e.normalize() !== playerAimed.normalize()))
  }
}