const { prefix } = require('../config.json')
const User = require('../database/user')
const Team = require('../database/team')
const Player = require('../functions/player')
const UserTeam = require('../database/userTeam')
const errorCard = require('../templates/errorCard')
const RegexFun = require('../functions/regex')
const noMention = require('../templates/noMention')

const getCards = async (interaction, array, fn) => {
  return Promise.all(array.map(async obj => {
    if (obj.discord) {
      const user = await User.exists(obj.param)
      if (user) return fn(interaction, user.steamId).catch(err => noMention(errorCard(err)))
      else return errorCard('This user hasn\'t linked his profile')
    } else return fn(interaction, obj.param).catch(err => noMention(errorCard(err)))
  })).then(msgs => msgs.map(msg => {
    const data = {
      embeds: msg.embeds || [],
      files: msg.files || [],
      components: msg.components || []
    }

    if (msg.content) data.content = msg.content

    return data
  }))
}

const getCardsConditions = async (interaction, fn, maxUser = 10, name = 'steam_parameters') => {
  let team = getInteractionOption(interaction, 'team')?.toLowerCase().trim().split(' ')[0]
  let faceit_parameters = getInteractionOption(interaction, 'faceit_parameters')?.trim().split(' ')
  const currentUser = await User.get(interaction.user.id)
  let parameters

  if (team) {
    team = await Team.getTeamSlug(team)
    if (!team) return errorCard('This team doesn\'t exist')
    else {
      const teamUsers = await UserTeam.getTeamUsers(team.slug)
      if (!teamUsers.length > 0) return errorCard('This team has no members')
      else if (
        await Team.getCreatorTeam(interaction.user.id).slug === team.slug ||
        team.access ||
        teamUsers?.find(user => user.steamId === currentUser.steamId)
      ) parameters = teamUsers.map(e => e.steamId).join(' ')
      else return errorCard('You don\'t have access to this team')
    }
  } else if (faceit_parameters) {
    await Promise.all(faceit_parameters.map(async nickname => await Player.getDatasFromNickname(nickname).catch(e => '*')))
      .then(params => {
        parameters = params.map(e => e?.steam_id_64 || e).join(' ')
      })
  } else parameters = getInteractionOption(interaction, name)
  const args = parameters?.trim().split(' ').filter(e => e !== '') || []

  if (args.length === 0)
    return currentUser ?
      getCards(interaction, [{ param: interaction.user.id, discord: true }], fn) :
      errorCard(`It seems like you didn't executed the command correctly, do \`/help command:${interaction.commandName}\` to get more informations about it.`)

  const steamIds = RegexFun.findSteamUIds(parameters)
    .slice(0, maxUser)
    .map(e => { return { param: e, discord: false } })

  if (steamIds.length > 0) return getCards(interaction, steamIds, fn)

  let params = []
  args.forEach(e => {
    const res = RegexFun.findUserMentions(e)
    params = params.concat(
      res.length > 0 ?
        res.map(r => {
          return {
            param: r,
            discord: true
          }
        })
        : { param: e.split('/').filter(e => e).pop(), discord: false }
    )
  })

  return getCards(interaction, params.slice(0, maxUser), fn)
}

const getInteractionOption = (interaction, name) => {
  return interaction.options?._hoistedOptions?.filter(o => o.name === name)[0]?.value
}

const isInteractionSubcommandEqual = (interaction, name) => {
  return interaction.options?._subcommand === name
}

module.exports = {
  getCardsConditions,
  getInteractionOption,
  isInteractionSubcommandEqual
}