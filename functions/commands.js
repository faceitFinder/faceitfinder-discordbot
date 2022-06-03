const User = require('../database/user')
const Team = require('../database/team')
const Player = require('./player')
const Steam = require('./steam')
const RegexFun = require('./regex')
const UserTeam = require('../database/userTeam')
const errorCard = require('../templates/errorCard')
const noMention = require('../templates/noMention')
const Discord = require('discord.js')

const getPlayerDatas = async (param, steam, discord = false) => {
  if (steam) {
    const steamId = await Steam.getId(param)
    return { param: await Player.getId(steamId).catch(() => steamId), discord }
  } else return { param, discord }
}

const getDefaultInteractionOption = (interaction) => {
  return interaction.message.components.at(0).components
    .filter(e => e instanceof Discord.MessageSelectMenu).at(0)
    .options
    .filter(e => e.default).at(0)
}

const getCards = async (interaction, array, fn) => {
  return Promise.all(array.map(async obj => {
    if (obj.discord) {
      const user = await User.exists(obj.param)
      if (user) return fn(interaction, user.faceitId).catch(err => noMention(errorCard(err)))
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
  let team = getInteractionOption(interaction, 'team')?.toLowerCase().trim().split(' ')[0],
    faceitParameters = getInteractionOption(interaction, 'faceit_parameters')?.trim().split(' '),
    steam = false,
    parameters = getInteractionOption(interaction, name)
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
      ) parameters = teamUsers.map(e => e.faceitId).join(' ')
      else return errorCard('You don\'t have access to this team')
    }
  } else if (faceitParameters) {
    await Promise.all(faceitParameters.map(async nickname => await Player.getDatasFromNickname(nickname).catch(() => nickname)))
      .then(params => {
        parameters = params.map(e => e?.player_id || e).join(' ')
      })
  } else steam = true
  const args = parameters?.trim().split(' ').filter(e => e !== '') || []

  if (args.length === 0)
    return currentUser ?
      getCards(interaction, [{ param: interaction.user.id, discord: true }], fn) :
      errorCard(`It seems like you didn't executed the command correctly, do \`/help command:${interaction.commandName}\` to get more informations about it.`)

  const steamIds = RegexFun.findSteamUIds(parameters)
    .slice(0, maxUser)
    .map(e => { return { param: e, discord: false } })

  if (steamIds.length > 0)
    return getCards(interaction, await Promise.all(steamIds.map(e => getPlayerDatas(e.param, steam, e.discord))), fn)

  let params = []
  args.forEach(e => {
    const res = RegexFun.findUserMentions(e)
    params = params.concat(
      res.length > 0 ?
        res.map(r => {
          return {
            param: r,
            steam: false,
            discord: true
          }
        })
        : { param: e.split('/').filter(e => e).pop(), steam, discord: false }
    )
  })

  return getCards(
    interaction,
    await Promise.all(
      params
        .slice(0, maxUser)
        .map(e => getPlayerDatas(e.param, e.steam, e.discord))),
    fn)
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
  isInteractionSubcommandEqual,
  getDefaultInteractionOption
}