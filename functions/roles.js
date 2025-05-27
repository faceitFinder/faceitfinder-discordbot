const { defaultGame, logChannel, logGuild, color } = require('../config.json')
const GuildCustomRole = require('../database/guildCustomRole')
const GuildRoles = require('../database/guildRoles')
const User = require('../database/user')
const { getStats } = require('./apiHandler')
const { getActiveGuildsEntitlements, currentGuildIsPremium } = require('./utility')

const REMOVE = 'REMOVE', ADD = 'ADD'

const getRoleIds = (guildRoles) => Object.keys(Object.entries(guildRoles)[2][1])
  .filter(e => e.startsWith('level')).map(e => guildRoles[e])

const getRoles = async (guildId) => {
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
  const guild = await client.guilds.fetch(guildId).catch(() => null)
  if (!guild) return console.warn(`Guild with ID ${guildId} not found`)

  user = [user].flat().filter(e => e).filter(e => e.guildId === guild.id || !e.guildId)?.at(0)

  console.info(`Setting up roles for guild: ${guild.name} (${guild.id})`)

  const isPremium = await currentGuildIsPremium(guildId)
  const roles = isPremium ? await GuildCustomRole.getRolesOf(guild.id) : await getRoles(guild.id)
  if (!roles?.length) return console.warn(`No roles found for guild: ${guild.name} (${guild.id})`)

  console.info(`Found ${roles.length} roles for guild: ${guild.name} (${guild.id})`)

  const members = await client.shard.broadcastEval(async (c, { guildId, user }) => {
    const g = await c.guilds.fetch(guildId).catch(() => null)
    if (!g || c.shard.ids[0] !== g.shardId) return []

    const members = await g.members.fetch({ cache: false }).catch(() => [])
    return members.filter(m => m.user && !m.user.bot).map(m => ({
      id: m.id,
      user: { id: m.user.id, username: m.user.username, tag: m.user.tag },
      roles: m.roles.cache.map(r => r.id),
      nickname: m.nickname,
    })).filter(m => user ? m.user.id === user.discordId : true)
  }, { context: { guildId, user } }).then(res => res.flat())

  console.info(`Found ${members.length} members in guild: ${guild.name} (${guild.id})`)

  for (const member of members) {
    let user = await User.get(member.user.id)
    if (!(user.length > 0)) continue

    if (user.length > 1) user = user.filter(e => e.guildId === guild.id)
    user = user.flat().at(0)
    if (!user?.faceitId) continue

    console.info(`Processing user: ${member.user.username} (${member.user.id}) in guild: ${guild.name} (${guild.id})`)

    const playerParam = { param: user.faceitId, faceitId: true }
    const stats = await getStats({ playerParam, game: defaultGame, matchNumber: 1 }).catch(() => null)
    if (!stats?.playerDatas?.games?.[defaultGame]) continue
    const playerElo = stats.playerDatas.games[defaultGame].faceit_elo

    if (user.nickname) {
      await guild.members.fetch(member.id).then(m => m.setNickname(stats.playerDatas.nickname)
        .catch((error) => console.error(`Failed to set nickname for ${member.user.tag} in guild ${guild.name}:`, error)))
    }

    for (const role of roles) {
      const removeRole = playerElo < role.eloMin || playerElo > role.eloMax
      const hasRole = member.roles.includes(role.roleId)

      if ((removeRole && hasRole) || remove) {
        await guild.members.fetch(member.id).then(m => m.roles.remove(role.roleId).catch(() => null))
        logRoleUpdate(client, member, role, guild, playerElo, REMOVE)
      } else if (!removeRole && !hasRole && !remove) {
        await guild.members.fetch(member.id).then(m => m.roles.add(role.roleId).catch(() => null))
        logRoleUpdate(client, member, role, guild, playerElo, ADD)
      }
    }
  }
}

const updateRoles = async (client, discordId, guildIds, remove = false) => {
  let user, guilds
  guildIds = [guildIds].flat().filter(e => e)

  if (discordId) {
    user = [await User.get(discordId)].flat()
    if (user.length > 1) {
      user = user.filter(e => guildIds.length ? guildIds.includes(e.guildId) : true)
    }
    guilds = user.map(e => e.guildId).filter((e, i, a) => a.indexOf(e) === i).filter(e => e)
  }

  if (!guilds.length) guilds = (await GuildCustomRole.getAll()).map(e => e.guildId).filter((e, i, a) => a.indexOf(e) === i)

  console.info(`Updating roles for ${guilds.length} guilds, user: ${discordId}, remove: ${remove}`)

  Promise.all(guilds.map(async guildId => {
    await setupRoles(client, user, guildId, remove).catch(console.error)
    return guildId
  })).then((guildIdsProcessed) => {
    if (remove) {
      if (!guildIds.length) User.remove(discordId, null, true)
        .then(() => console.info(`User ${discordId} removed from all guilds`))
      else {
        guildIdsProcessed.forEach(guildId => {
          User.remove(discordId, guildId).then(() => console.info(`User ${discordId} removed from guild: ${guildId}`))
        })
      }
    }
  }).catch(console.error)
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
  const activeGuildEntitlements = await getActiveGuildsEntitlements(client, true)
  updateRoles(client, null, activeGuildEntitlements.map(e => e.guildId))
}

module.exports = {
  updateRoles,
  getRoleIds,
  updateSubscribedGuilds,
}
