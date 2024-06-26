const User = require('../database/user')
const Team = require('../database/team')
const RegexFun = require('./regex')
const UserTeam = require('../database/userTeam')
const errorCard = require('../templates/errorCard')
const noMention = require('../templates/noMention')
const { updateRoles } = require('./roles')
const { getTranslation } = require('../languages/setup')
const { getInteractionOption } = require('./utility')

const getPlayerDatas = async (interaction, param, steam, discord = false, faceitId = false, verified = false) => {
  if (discord) {
    const userGuilds = await User.get(param)
    if (userGuilds.length > 0) {
      let user = userGuilds.find(e => !e.guildId)
      if (!user) user = userGuilds.find(e => e.guildId === interaction.guild.id)

      verified = user?.verified ?? false

      if (user) return { param: user.faceitId, steam: false, discord: false, faceitId: true, verified: verified }
    }

    throw getTranslation('error.user.notLinked', interaction.locale, {
      discord: `<@${param}>`
    })
  }

  return { param: param, steam, discord, faceitId, verified: verified }
}

const getCards = ({ interaction, array, fn }) => {
  return Promise.all(array.map(obj => fn(interaction, obj).catch(err => noMention(errorCard(err, interaction.locale)))))
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
  faceit = 'faceit_parameters',
  searchTeam = true,
  searchCurrentUser = true
) => {
  let team = getInteractionOption(interaction, 'team')?.toLowerCase().trim().split(' ')[0]
  const faceitParameters = getInteractionOption(interaction, faceit)?.replace(/\s+/g, ' ').split(' ')
  const steamParameters = getInteractionOption(interaction, steam)

  const parameters = []
  let currentUser = await User.getWithGuild(interaction.user.id, null)
  if (!currentUser) currentUser = await User.getWithGuild(interaction.user.id, interaction.guild.id)

  if (searchTeam && team) {
    team = await Team.getTeamSlug(team)
    if (!team) throw getTranslation('error.command.teamNotFound', interaction.locale)
    else {
      const teamUsers = await UserTeam.getTeamUsers(team.slug)
      const teamCreator = await Team.getCreatorTeam(interaction.user.id)

      if (!teamUsers.length > 0) throw getTranslation('error.command.teamEmpty', interaction.locale)
      else if ((teamCreator &&
        teamCreator.slug === team.slug) ||
        team.access ||
        teamUsers?.find(user => user.faceitId === currentUser.faceitId)
      ) parameters.push(...teamUsers.map(e => {
        return { param: e.faceitId, faceitId: true }
      }))
      else throw getTranslation('error.command.teamNoAccess', interaction.locale)
    }
  }

  if (faceitParameters) {
    parameters.push(...faceitParameters.map(nickname => nickname.split('/').filter(e => e).pop()).map(e => {
      return { param: e }
    }))
  }

  if (steamParameters) {
    const steamIds = RegexFun.findSteamUIds(steamParameters)
      .slice(0, maxUser)
      .map(e => { return { param: e, steam: true } })

    if (steamIds.length > 0) parameters.push(...steamIds)
    else parameters.push(...steamParameters?.replace(/\s+/g, ' ').split(' ').map(e => {
      return {
        param: e,
        steam: true,
      }
    }))
  }

  if (parameters.length === 0 && currentUser && searchCurrentUser) {
    parameters.push({ param: currentUser.faceitId, faceitId: true, verified: !!currentUser?.verified })
    updateRoles(interaction.client, interaction.user.id, interaction.guild.id)
  }

  let params = []
  parameters.forEach(e => {
    const res = RegexFun.findUserMentions(e.param)
    params = params.concat(
      res.length > 0 ?
        res.map(r => { return { param: r, discord: true, verified: !!e?.verified } }) :
        { param: e.param.split('/').filter(e => e).pop(), steam: e.steam, discord: e.discord, faceitId: e.faceitId, verified: !!e?.verified }
    )
  })

  if (params.length === 0 && searchCurrentUser) throw getTranslation('error.command.atLeastOneParameter', interaction.locale, {
    parameters: [steam, faceit, searchTeam ? 'team' : null].filter(e => e).join(', '),
    command: interaction.commandName
  })

  return Promise.all(params
    .slice(0, maxUser)
    .map(e => getPlayerDatas(interaction, e.param, e.steam, e.discord, e.faceitId, e.verified)))
}

const getCardsConditions = async ({
  interaction,
  fn,
  maxUser = 10,
  steam = 'steam_parameters',
  faceit = 'faceit_parameters',
  searchTeam = true,
  searchCurrentUser = true,
  required = false
}) => {
  const users = await getUsers(interaction, maxUser, steam, faceit, searchTeam, searchCurrentUser)

  if (required && !users.length) throw getTranslation('error.command.atLeastOneParameter', interaction.locale, {
    parameters: [steam, faceit, searchTeam ? 'team' : null].filter(e => e).join(', '),
    command: interaction.commandName
  })

  return getCards({
    interaction,
    array: users,
    fn
  })
}

module.exports = {
  getCardsConditions,
  getUsers
}
