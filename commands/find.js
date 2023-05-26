const { ApplicationCommandOptionType } = require('discord.js')
const Options = require('../templates/options')
const { getUsers, getInteractionOption } = require('../functions/commands')
const { sendCardWithInfo } = require('./last')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const User = require('../database/user')

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.unshift({
    name: 'player_aimed',
    description: getTranslation('options.playerAimed', 'en-US'),
    descriptionLocalizations: getTranslations('options.playerAimed'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, getMapOption(), {
    name: 'excluded_steam_parameters',
    description: getTranslation('options.excludedSteamParameters', 'en-US'),
    descriptionLocalizations: getTranslations('options.excludedSteamParameters'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, {
    name: 'excluded_faceit_parameters',
    description: getTranslation('options.excludedFaceitParameters', 'en-US'),
    descriptionLocalizations: getTranslations('options.excludedFaceitParameters'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, {
    name: 'match_number',
    description: getTranslation('options.matchNumber', 'en-US', {
      default: 'strings.fullHistory'
    }),
    descriptionLocalizations: getTranslations('options.matchNumber', {
      default: 'strings.fullHistory'
    }),
    required: false,
    type: ApplicationCommandOptionType.Integer,
    slash: true
  })

  return options
}

module.exports = {
  name: 'find',
  options: getOptions(),
  description: getTranslation('command.find.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.find.description'),
  usage: '{player_aimed} [<steam_parameters> <faceit_parameters> <team>] <map> <excluded_steam_parameters> <excluded_faceit_parameters> <match_number>',
  example: 'player_aimed: justdams steam_parameters: weder77 faceit_parameters: sheraw excluded_faceit_parameters: KanzakiR3D map: Vertigo match_number: 20',
  type: 'stats',
  async execute(interaction) {
    let currentPlayer = await User.getWithGuild(interaction.user.id, null)
    if (!currentPlayer) currentPlayer = await User.getWithGuild(interaction.user.id, interaction.guild.id)
    const playerAimed = (await getUsers(interaction, 2, 'player_aimed', 'player_aimed', false))
      .find(e => e.param.match(/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i))
      ?.param

    const users = (await getUsers(interaction, 5)).map(p => p.param).filter((e, i, a) => a.indexOf(e) === i)
    let excludedUsers = (await getUsers(interaction, 10, 'excluded_steam_parameters', 'excluded_faceit_parameters', false))
      .map(p => p.param).filter((e, i, a) => a.indexOf(e) === i)

    const excludedSteam = getInteractionOption(interaction, 'excluded_steam_parameters')
    const excludedFaceit = getInteractionOption(interaction, 'excluded_faceit_parameters')

    if (!excludedSteam && !excludedFaceit && currentPlayer) excludedUsers = excludedUsers.filter(e => e.normalize() !== currentPlayer.faceitId)
    if (excludedUsers.some(e => users.includes(e)) || excludedUsers.includes(playerAimed)) throw getTranslation('error.user.excluded', interaction.locale)

    const maxMatch = getInteractionOption(interaction, 'match_number')

    return sendCardWithInfo(
      interaction,
      playerAimed,
      null,
      0,
      users.filter(e => e.normalize() !== playerAimed.normalize()),
      null,
      excludedUsers,
      maxMatch
    )
  }
}