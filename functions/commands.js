const User = require('../database/user')
const Team = require('../database/team')
const Player = require('./player')
const Steam = require('./steam')
const RegexFun = require('./regex')
const UserTeam = require('../database/userTeam')
const errorCard = require('../templates/errorCard')
const Discord = require('discord.js')
const noMention = require('../templates/noMention')

const getPlayerDatas = async (param, steam, discord = false) => {
  if (steam) {
    const steamId = await Steam.getId(param)
    return { param: await Player.getId(steamId).catch(() => steamId), discord }
  }
  if (discord) {
    const user = await User.exists(param)
    if (user) return { param: user.faceitId, discord }
    else throw `<@${param}> hasn't linked his profile`
  }
  return { param, discord }
}

const getDefaultInteractionOption = (interaction) => {
  return interaction.message.components.at(0).components
    .filter(e => e instanceof Discord.MessageSelectMenu).at(0)
    .options
    .filter(e => e.default).at(0)
}

const getCards = async (interaction, array, fn) => {
  return Promise.all(array.map(async obj => fn(interaction, obj.param).catch(err => noMention(errorCard(err)))))
    .then(msgs => msgs.map(msg => {
      const data = {
        embeds: msg.embeds || [],
        files: msg.files || [],
        components: msg.components || []
      }

      if (msg.content) data.content = msg.content

      return data
    }))
}

const getUsers = async (
  interaction,
  maxUser = 10,
  steam = 'steam_parameters',
  faceit = 'faceit_parameters'
) => {
  let team = getInteractionOption(interaction, 'team')?.toLowerCase().trim().split(' ')[0]
  const faceitParameters = getInteractionOption(interaction, faceit)?.trim().split(' ')
  const steamParameters = getInteractionOption(interaction, steam)

  const parameters = []
  const currentUser = await User.get(interaction.user.id)

  if (team) {
    team = await Team.getTeamSlug(team)
    if (!team) return errorCard('This team doesn\'t exist')
    else {
      const teamUsers = await UserTeam.getTeamUsers(team.slug)
      if (!teamUsers.length > 0) return errorCard('This team has no members')
      else if (
        await Team.getCreatorTeam(interaction.user.id).slug === team.slug ||
        team.access ||
        teamUsers?.find(user => user.faceitId === currentUser.faceitId)
      ) parameters.push(...teamUsers.map(e => {
        return { param: e.faceitId, steam: false, discord: false }
      }))
      else return errorCard('You don\'t have access to this team')
    }
  }
  if (faceitParameters) {
    await Promise.all(faceitParameters
      .map(async nickname => await Player.getDatasFromNickname(nickname)
        .catch(async () => {
          const player = await Player.searchPlayer(nickname)
          return player.items?.at(0) || nickname
        }))
    ).then(params => {
      parameters.push(...params.map(e => {
        return {
          param: e?.player_id || e,
          steam: false,
          discord: false
        }
      }))
    })
  }
  if (steamParameters) {
    const steamIds = RegexFun.findSteamUIds(steamParameters)
      .slice(0, maxUser)
      .map(e => { return { param: e, steam: true, discord: false } })

    if (steamIds.length > 0) parameters.push(...steamIds)
    else parameters.push(...steamParameters?.trim().split(' ').filter(e => e !== '').map(e => {
      return {
        param: e,
        steam: true,
        discord: false
      }
    }))
  }
  if (parameters.length === 0 && currentUser)
    parameters.push({ param: currentUser.faceitId, steam: false, discord: false })

  let params = []
  parameters.forEach(e => {
    const res = RegexFun.findUserMentions(e.param)
    params = params.concat(
      res.length > 0 ?
        res.map(r => {
          return {
            param: r,
            steam: false,
            discord: true
          }
        })
        : { param: e.param.split('/').filter(e => e).pop(), steam: e.steam, discord: e.discord }
    )
  })

  if (params.length === 0) throw 'Please specify a user or a team. \n\
    You can also link your profile with Faceit to use this command without parameters.'

  return Promise.all(params
    .slice(0, maxUser)
    .map(e => getPlayerDatas(e.param, e.steam, e.discord)))
}

const getCardsConditions = async (
  interaction,
  fn,
  maxUser = 10,
  steam = 'steam_parameters',
  faceit = 'faceit_parameters'
) => getCards(
  interaction,
  await getUsers(interaction, maxUser, steam, faceit),
  fn)

const getInteractionOption = (interaction, name) => {
  return interaction.options?._hoistedOptions?.filter(o => o.name === name)[0]?.value
}

const isInteractionSubcommandEqual = (interaction, name) => {
  return interaction.options?._subcommand === name
}

module.exports = {
  getCardsConditions,
  getInteractionOption,
  isInteractionSubcommandEqual,
  getDefaultInteractionOption,
  getUsers
}