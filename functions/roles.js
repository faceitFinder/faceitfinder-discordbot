const GuildRoles = require('../database/guildRoles')
const User = require('../database/user')
const Player = require('./player')

const getRoleIds = (guildRoles) => Object.keys(Object.entries(guildRoles)[2][1])
  .filter(e => e.startsWith('level')).map(e => guildRoles[e])

const setupRoles = async (client, user, guildRoles, remove) => {
  const guildDatas = await client.guilds.fetch(guildRoles.id)
  let members

  if (user.length > 0) members = [await guildDatas.members.fetch(user.at(0).discordId)]
  else members = await guildDatas.members.fetch({ cache: false })

  members?.forEach(async (member) => {
    if (!member) return
    let user = await User.get(member.user.id)

    if (!(user.length > 0)) return
    else if (user.length > 1) user = user.filter(e => e.guildId === guildDatas.id)

    user = user.flat().at(0)

    const playerDatas = await Player.getDatas(user.faceitId).catch(console.error)

    if (!playerDatas?.games?.csgo) return

    const playerLevel = playerDatas.games.csgo.skill_level
    const roleLevels = getRoleIds(guildRoles)

    const roleToAdd = roleLevels[playerLevel - 1]
    const rolesFit = member.roles.resolve(roleToAdd)

    if (user.nickname) await member.edit({ nick: playerDatas.nickname }).catch(console.error)
    if (remove || !rolesFit) await member.roles.remove(roleLevels).catch(console.error)
    if (!remove && !rolesFit) await member.roles.add(roleToAdd).catch(console.error)
  })
}

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let user, guilds

  if (discordId) user = await User.get(discordId)

  if (guildId) guilds = [await GuildRoles.getRolesOf(guildId)]
  else guilds = [await GuildRoles.getAll()].flat()

  Promise.all(guilds.map(async guildRoles => await setupRoles(client, user, guildRoles, remove).catch(console.error)))
    .then(() => { if (remove) User.remove(discordId, guildId) })
    .catch(console.error)
}

module.exports = {
  updateRoles
}
