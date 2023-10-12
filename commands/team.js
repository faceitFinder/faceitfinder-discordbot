const { maxLengthTeamName, defaultGame } = require('../config.json')
const Discord = require('discord.js')
const Team = require('../database/team')
const UserTeam = require('../database/userTeam')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const { isInteractionSubcommandEqual, getInteractionOption, getCardsConditions } = require('../functions/commands')
const successCard = require('../templates/successCard')
const { getTranslation, getTranslations } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')

const INFO = 'info'
const CREATE = 'create'
const DELETE = 'delete'
const UPDATE = 'update'
const ADD_USER = 'add_user'
const REMOVE_USER = 'remove_user'

const createTeam = async (interaction, currentTeam, user) => {
  if (currentTeam) return errorCard(getTranslation('error.command.alreadyOwnTeam', interaction.locale, {
    teamName: currentTeam.name
  }), interaction.locale)
  const teamName = getInteractionOption(interaction, 'name')
  const teamSlug = teamName.toLowerCase().replace(/\s/g, '-')
  if (teamName.length > maxLengthTeamName) return errorCard('error.command.teamNameTooLong', interaction.locale)
  else if (await Team.getTeamSlug(teamSlug)) return errorCard('error.command.teamNameAlreadyExist', interaction.locale)
  const access = getInteractionOption(interaction, 'access')
  Team.create(teamName, teamSlug, user, access)

  return successCard(getTranslation('success.command.createTeam', interaction.locale, {
    teamName: teamName
  }), interaction.locale)
}

const infoTeam = async (interaction, currentTeam, user) => {
  let currentUser = await User.getWithGuild(user, null)
  if (!currentUser) currentUser = await User.getWithGuild(user, interaction.guild.id)
  const userTeams = []

  if (currentUser) {
    const currentUserTeams = await UserTeam.getUserTeams(currentUser.faceitId)
    if (currentUserTeams)
      userTeams.push(...await Promise.all(currentUserTeams.map(async (userTeam) => await Team.getTeamSlug(userTeam.slug))))
  }
  if (currentTeam) userTeams.push(currentTeam)
  if (userTeams.length === 0) return errorCard('error.user.noTeam', interaction.locale)

  const options = Array.from(new Set(userTeams.map(JSON.stringify)))
    .map(JSON.parse)
    .map(userteam => {
      if (userteam) return {
        label: userteam.name,
        description: getTranslation('strings.infoTeam', interaction.locale, {
          teamName: userteam.name,
        }),
        value: JSON.stringify({
          tn: userteam.slug,
          u: user,
        })
      }
    })
    .filter(e => e !== undefined)

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId('teamInfoSelector')
        .setPlaceholder(getTranslation('strings.selectTeam', interaction.locale))
        .addOptions(options.slice(0, 25)))

  return {
    components: [
      row
    ]
  }
}

const updateTeam = async (interaction, currentTeam) => {
  const teamName = getInteractionOption(interaction, 'name')
  const teamSlug = teamName?.toLowerCase().replace(/\s/g, '-')
  if (teamName && await Team.getTeamSlug(teamSlug)) return errorCard('error.command.teamNameAlreadyExists', interaction.locale)
  else if (teamName) await UserTeam.updateMany(currentTeam.slug, teamSlug)
  const access = getInteractionOption(interaction, 'access')
  Team.update(currentTeam.slug, teamName || currentTeam.name, teamSlug || currentTeam.slug, access)
  return successCard(getTranslation('success.command.updateTeam', interaction.locale, {
    teamName: teamName || currentTeam.name
  }), interaction.locale)
}

const deleteTeam = async (interaction, currentTeam, user) => {
  Team.remove(user)
  UserTeam.getTeamUsers(currentTeam.slug)
    .then(users => {
      users.forEach(user => UserTeam.remove(user.faceitId, currentTeam.slug))
    })

  return successCard(getTranslation('success.command.removeTeam', interaction.locale, {
    teamName: currentTeam.name
  }), interaction.locale)
}

const addUser = async (interaction, playerParam) => {
  const user = interaction.user.id
  const currentTeam = await Team.getCreatorTeam(user)
  const {
    playerDatas
  } = await getStats({
    playerParam,
    matchNumber: 1,
    game: defaultGame,
  })
  const playerId = playerDatas.player_id

  if (await UserTeam.getUserTeam(playerId, currentTeam.slug))
    return errorCard(getTranslation('error.user.alreadyInTeam', interaction.locale, {
      playerName: playerDatas.nickname,
      teamName: currentTeam.name
    }))

  UserTeam.create(currentTeam.slug, playerId)

  const successMessage = getTranslation('success.command.addUser', interaction.locale, {
    playerName: playerDatas.nickname,
    teamName: currentTeam.name
  })

  return successCard(`${successMessage} [Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}) - [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`, interaction.locale)
}

const removeUser = async (interaction, playerParam) => {
  const user = interaction.user.id
  const currentTeam = await Team.getCreatorTeam(user)
  const {
    playerDatas
  } = await getStats({
    playerParam,
    matchNumber: 1,
    game: defaultGame,
  })
  const playerId = playerDatas.player_id

  if (!await UserTeam.getUserTeam(playerId, currentTeam.slug))
    return errorCard(getTranslation('error.user.notInTeam', interaction.locale, {
      playerName: playerDatas.nickname,
      teamName: currentTeam.name
    }), interaction.locale)

  UserTeam.remove(playerId, currentTeam.slug)

  return successCard(getTranslation('success.command.removeUser', interaction.locale, {
    playerName: playerDatas.nickname,
    teamName: currentTeam.name
  }), interaction.locale)
}

module.exports = {
  name: 'team',
  options: [
    {
      name: INFO,
      description: getTranslation('options.infoTeam', 'en-US'),
      descriptionLocalizations: getTranslations('options.infoTeam'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true
    },
    {
      name: CREATE,
      description: getTranslation('options.createTeam', 'en-US'),
      descriptionLocalizations: getTranslations('options.createTeam'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'name',
          description: getTranslation('options.nameTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.nameTeam'),
          type: Discord.ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: 'access',
          description: getTranslation('options.accessTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.accessTeam'),
          type: Discord.ApplicationCommandOptionType.Boolean,
          required: true
        }
      ]
    },
    {
      name: UPDATE,
      description: getTranslation('options.updateTeam', 'en-US'),
      descriptionLocalizations: getTranslations('options.updateTeam'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'access',
          description: getTranslation('options.accessTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.accessTeam'),
          type: Discord.ApplicationCommandOptionType.Boolean,
          required: true
        },
        {
          name: 'name',
          description: getTranslation('options.nameTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.nameTeam'),
          type: Discord.ApplicationCommandOptionType.String,
          required: false
        }
      ]
    },
    {
      name: DELETE,
      description: getTranslation('options.deleteTeam', 'en-US'),
      descriptionLocalizations: getTranslations('options.deleteTeam'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true
    },
    {
      name: ADD_USER,
      description: getTranslation('options.addUserTeam', 'en-US'),
      descriptionLocalizations: getTranslations('options.addUserTeam'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'steam_parameters',
          description: getTranslation('options.steamParametersTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.steamParametersTeam'),
          type: Discord.ApplicationCommandOptionType.String,
          required: false
        },
        {
          name: 'faceit_parameters',
          description: getTranslation('options.faceitParametersTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.faceitParametersTeam'),
          type: Discord.ApplicationCommandOptionType.String,
          required: false
        }
      ]
    },
    {
      name: REMOVE_USER,
      description: getTranslation('options.removeUserTeam', 'en-US'),
      descriptionLocalizations: getTranslations('options.removeUserTeam'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'steam_parameters',
          description: getTranslation('options.steamParametersTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.steamParametersTeam'),
          type: Discord.ApplicationCommandOptionType.String,
          required: false
        },
        {
          name: 'faceit_parameters',
          description: getTranslation('options.faceitParametersTeam', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.faceitParametersTeam'),
          type: Discord.ApplicationCommandOptionType.String,
          required: false
        }
      ]
    }
  ],
  description: getTranslation('command.team.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.team.description'),
  usage: `
  - ${CREATE} [team name]
  - ${DELETE}
  - ${UPDATE} [access] <name>
  - ${INFO}
  - ${ADD_USER} [<steam_parameters> <faceit_parameters>]
  - ${REMOVE_USER} [<steam_parameters> <faceit_parameters>]`,
  type: 'utility',
  async execute(interaction) {
    const user = interaction.user.id
    const currentTeam = await Team.getCreatorTeam(user)

    if (!currentTeam && !isInteractionSubcommandEqual(interaction, CREATE) &&
      !isInteractionSubcommandEqual(interaction, INFO)) return errorCard('error.user.teamOwn', interaction.locale)
    else if (isInteractionSubcommandEqual(interaction, CREATE)) return createTeam(interaction, currentTeam, user)
    else if (isInteractionSubcommandEqual(interaction, INFO)) return infoTeam(interaction, currentTeam, user)
    else if (isInteractionSubcommandEqual(interaction, UPDATE)) return updateTeam(interaction, currentTeam, user)
    else if (isInteractionSubcommandEqual(interaction, DELETE)) return deleteTeam(interaction, currentTeam, user)
    else if (isInteractionSubcommandEqual(interaction, ADD_USER)) {
      const teamUsers = await UserTeam.getTeamUsers(currentTeam.slug)
      if (teamUsers.length >= 5) return errorCard('error.user.teamFull', interaction.locale)
      return getCardsConditions(interaction, addUser, 5 - teamUsers.length, 'steam_parameters', 'faceit_parameters', false)
    } else if (isInteractionSubcommandEqual(interaction, REMOVE_USER)) return getCardsConditions(interaction, removeUser, 5)
    else return errorCard('error.command.notFound', interaction.locale)
  }
}