const GuildRoles = require('../database/guildRoles')
const User = require('../database/user')
const Player = require('./player')

const getGuildRoles = (guild, guilds) => guilds.filter(e => e).find(e => e.id === guild.id)

const getRoleIds = (guildRoles) => Object.keys(Object.entries(guildRoles)[2][1])
  .filter(e => e.startsWith('level')).map(e => guildRoles[e])

const setupRoles = async (users, data, remove) => {
  const [guildRoles, guild] = [data.guildRoles, data.guild]
  const guildDatas = await guild.fetch()
  const members = await guildDatas.members.fetch({ user: users.filter(e => e.guildId === guildDatas.id || !e.guildId).map(e => e.discordId) })

  members.forEach(async (member) => {
    let user = await User.get(member.user.id)

    if (!(user.length > 0)) return
    else if (user.length > 1) user = user.filter(e => e.guildId === guildDatas.id)

    user = user.flat().at(0)

    const playerDatas = await Player.getDatas(user.faceitId).catch(console.error)
    const playerLevel = playerDatas.games.csgo.skill_level
    const roleLevels = getRoleIds(guildRoles)

    const roleToAdd = roleLevels[playerLevel - 1]
    const rolesFit = member.roles.resolve(roleToAdd)

    if (remove || !rolesFit) await member.roles.remove(roleLevels).catch(console.error)
    if (!remove && !rolesFit) await member.roles.add(roleToAdd).catch(console.error)
  })
}

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let users, guilds

  if (discordId) users = await User.get(discordId)
  else users = await User.getAll()

  if (guildId) guilds = [await GuildRoles.getRolesOf(guildId)]
  else guilds = await GuildRoles.getAll()

  const clientGuilds = client.guilds.cache
  const datas = clientGuilds.map(guild => { return { guildRoles: getGuildRoles(guild, guilds), guild: guild } }).filter(e => e.guildRoles)

  Promise.all(datas.map(data => setupRoles(users, data, remove)))
    .then(() => {
      if (remove) User.remove(discordId, guildId)
    })
    .catch(console.error)
}

module.exports = {
  updateRoles
}