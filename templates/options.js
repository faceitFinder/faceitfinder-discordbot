const { ApplicationCommandOptionType } = require('discord.js')

const stats = [
  {
    name: 'steam_parameters',
    description: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  },
  {
    name: 'team',
    description: 'team slug (you need to be a part of it, the creator, or it has to be public)',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  },
  {
    name: 'faceit_parameters',
    description: 'faceit nicknames / @users',
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }
]

const usage = 'steam_parameters:multiple steam params and @user OR CSGO status AND team:team slug (max 1) AND faceit_parameters:multiple faceit nicknames and @user (max 10 users overall)'

module.exports = {
  stats,
  usage
}