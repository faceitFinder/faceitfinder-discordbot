const GuildRoles = require('../database/guildRoles')
const GuildCustomRole = require('../database/guildCustomRole')
const User = require('../database/user')
const { getFaceitPlayerDatas } = require('./player')

const getRoleIds = (guildRoles) => Object.keys(Object.entries(guildRoles)[2][1])
  .filter(e => e.startsWith('level')).map(e => guildRoles[e])

const setupRoles = async (client, user, guildRoles, remove) => {
  const guildId = guildRoles.guildId ?? guildRoles.id
  const guildDatas = await client.guilds.fetch(guildId)
  let members

  if (user) members = [await guildDatas.members.fetch(user.at(0).discordId).catch(() => null)]
  else members = await guildDatas.members.fetch({ cache: false })

  members?.forEach(async (member) => {
    if (!member) return
    let user = await User.get(member.user.id)

    if (!(user.length > 0)) return
    else if (user.length > 1) user = user.filter(e => e.guildId === guildDatas.id)

    user = user.flat().at(0)

    const playerDatas = await getFaceitPlayerDatas(user.faceitId).catch(console.error)

    if (!playerDatas?.games?.csgo) return

    const playerLevel = playerDatas.games.csgo.skill_level
    const playerElo = playerDatas.games.csgo.faceit_elo
    const rolesToAdd = []

    if (guildRoles?.guildId) {
      if (playerElo >= guildRoles.eloMin && playerElo <= guildRoles.eloMax)
        rolesToAdd.push(guildRoles.roleId)
    } else {
      const roleLevels = getRoleIds(guildRoles)
      rolesToAdd.push(roleLevels[playerLevel - 1])
    }

    if (user.nickname) await member.edit({ nick: playerDatas.nickname }).catch(console.error)

    rolesToAdd.forEach(async (role) => {
      const rolesFit = member.roles.resolve(role)

      if (remove || !rolesFit) await member.roles.remove(role).catch(console.error)
      if (!remove && !rolesFit) await member.roles.add(role).catch(console.error)
    })
  })
}

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let user, guildRoles

  if (discordId) user = await User.get(discordId)

  if (guildId) guildRoles = [await GuildRoles.getRolesOf(guildId), await GuildCustomRole.getRolesOf(guildId)].flat()
  else guildRoles = [await GuildRoles.getAll(), await GuildCustomRole.getAll()].flat()

  Promise.all(guildRoles.map(async guildRoles => await setupRoles(client, user, guildRoles, remove).catch(console.error)))
    .then(() => { if (remove) User.remove(discordId, guildId) })
    .catch(console.error)
}

module.exports = {
  updateRoles
}
