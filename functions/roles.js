const GuildCustomRole = require('../database/guildCustomRole')
const User = require('../database/user')
const { getFaceitPlayerDatas } = require('./player')

const getRoleIds = (guildRoles) => Object.keys(Object.entries(guildRoles)[2][1])
  .filter(e => e.startsWith('level')).map(e => guildRoles[e])

const setupRoles = async (client, user, guildId, remove) => {
  const guildDatas = await client.guilds.fetch(guildId)
  let members

  if (user) members = [await guildDatas.members.fetch(user.at(0).discordId).catch(() => null)]
  else members = await guildDatas.members.fetch({ cache: false })

  const roles = await GuildCustomRole.getRolesOf(guildDatas.id)

  members?.forEach(async (member) => {
    if (!member) return
    let user = await User.get(member.user.id)

    if (!(user.length > 0)) return
    else if (user.length > 1) user = user.filter(e => e.guildId === guildDatas.id)

    user = user.flat().at(0)

    const playerDatas = await getFaceitPlayerDatas(user.faceitId).catch(console.error)
    if (!playerDatas?.games?.csgo) return

    const playerElo = playerDatas.games.csgo.faceit_elo

    if (user.nickname) await member.edit({ nick: playerDatas.nickname }).catch(console.error)

    roles.forEach(async (role) => {
      const removeRole = remove || playerElo < role.eloMin || playerElo > role.eloMax
      const roleId = role.roleId
      const rolesFit = member.roles.resolve(roleId)

      if (removeRole || !rolesFit) await member.roles.remove(roleId).catch((err) => handleRoleErrors(err, role))
      if (!removeRole && !rolesFit) await member.roles.add(roleId).catch((err) => handleRoleErrors(err, role))
    })
  })
}

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let user, guilds

  if (discordId) user = await User.get(discordId)

  if (guildId) guilds = [guildId].flat()
  else guilds = (await GuildCustomRole.getAll()).map(e => e.guildId).filter((e, i, a) => a.indexOf(e) === i)

  Promise.all(guilds.map(async guild => await setupRoles(client, user, guild, remove).catch(console.error)))
    .then(() => { if (remove) User.remove(discordId, guildId) })
    .catch(console.error)
}

const handleRoleErrors = (err, role) => {
  if (err.status === '404') GuildCustomRole.remove(role.guildId, role.roleId)
}

module.exports = {
  updateRoles,
  getRoleIds
}
