const { defaultGame, logChannel, logGuild, color } = require('../config.json')
const GuildCustomRole = require('../database/guildCustomRole')
const GuildRoles = require('../database/guildRoles')
const User = require('../database/user')
const { getStats } = require('./apiHandler')
const { getActiveGuildsEntitlements, currentGuildIsPremium } = require('./utility')

const REMOVE = 'REMOVE', ADD = 'ADD'

const getRoleIds = (guildRoles) => Object.keys(Object.entries(guildRoles)[2][1])
  .filter(e => e.startsWith('level')).map(e => guildRoles[e])

const getCustomRoles = async (guildId) => {
  const roles = await GuildRoles.getRolesOf(guildId)
  if (!roles) return

  const roleIds = getRoleIds(roles)
  return Object.entries(color.levels[defaultGame]).map(([level, range], index) => {
    return {
      guildId: guildId,
      roleId: roleIds[index],
      eloMin: range.min,
      eloMax: range.max
    }
  })
}

const setupRoles = async (client, user, guildId, remove) => {
  const guildDatas = await client.guilds.fetch(guildId)
  let members

  if (user && user.length > 0) members = [await guildDatas.members.fetch({ user: user.at(0).discordId, cache: false }).catch(() => null)]
  else members = await guildDatas.members.fetch({ cache: false })

  const isPremium = await currentGuildIsPremium(client, guildId)
  const roles = isPremium ? await GuildCustomRole.getRolesOf(guildDatas.id) : await getCustomRoles(guildDatas.id)
  if (!roles) return

  members?.forEach(async (member) => {
    if (!member?.user) return
    let user = await User.get(member.user.id)

    if (!(user.length > 0)) return
    else if (user.length > 1) user = user.filter(e => e.guildId === guildDatas.id)

    user = user.flat().at(0)

    const playerParam = { param: user.faceitId, faceitId: true }
    const stats = await getStats({ playerParam, game: defaultGame, matchNumber: 1 }).catch(() => null)

    if (!stats) return

    const playerDatas = stats.playerDatas

    if (!playerDatas?.games[defaultGame]) return

    const playerElo = playerDatas.games[defaultGame].faceit_elo

    if (user.nickname) await member.edit({ nick: playerDatas.nickname }).catch(() => null)

    roles.forEach(async (role) => {
      const removeRole = playerElo < role.eloMin || playerElo > role.eloMax
      const roleId = role.roleId
      const rolesFit = !!member.roles.resolve(roleId)

      // Remove role if it doesn't fit the criteria and the role is assigned or if the remove flag is set
      if ((removeRole && rolesFit) || remove)
        await member.roles.remove(roleId)
          .then(e => logRoleUpdate(client, member, role, guildDatas, playerElo, REMOVE))
          .catch((err) => handleRoleErrors(err, role))

      // Add role if it fits the criteria and the role isn't already assigned
      if (!removeRole && !rolesFit)
        await member.roles.add(roleId)
          .then(e => logRoleUpdate(client, member, role, guildDatas, playerElo, ADD))
          .catch((err) => handleRoleErrors(err, role))
    })
  })
}

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let user, guilds

  if (discordId) {
    user = [await User.get(discordId)].flat()
    if (user.length > 1) user = user.filter(e => e.guildId === guildId)
    guildId = user.at(0)?.guildId
  }

  if (guildId) guilds = [guildId].flat()
  else guilds = (await GuildCustomRole.getAll()).map(e => e.guildId).filter((e, i, a) => a.indexOf(e) === i)

  Promise.all(guilds.map(async guild => await setupRoles(client, user, guild, remove).catch(console.error)))
    .then(() => { if (remove) User.remove(discordId, guildId) })
    .catch(console.error)
}

const handleRoleErrors = (err, role) => {
  if (err.status === '404') GuildCustomRole.remove(role.guildId, role.roleId)
}

const logRoleUpdate = (client, member, role, guildDatas, playerElo, action) => {
  client.guilds.fetch(logGuild)
    .then(guild => guild.channels.fetch(logChannel))
    .then(channel => channel.send({
      content: `
\`\`\`js
Guild: ${guildDatas.name} (${guildDatas.id})
User: ${member.user.tag} (${member.user.id})
Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', timeStyle: 'short', dateStyle: 'long' })}
Role: ${role.roleId} - Elo: ${role.eloMin} - ${role.eloMax}
Elo: ${playerElo}
Action: ${action}
\`\`\`
      `,
    }))
    .catch(console.error)
}

const updateSubscribedGuilds = async (client) => {
  const activeGuildEntitlements = await getActiveGuildsEntitlements(client)
  updateRoles(client, null, activeGuildEntitlements.map(e => e.guildId))
}

module.exports = {
  updateRoles,
  getRoleIds,
  updateSubscribedGuilds,
}
