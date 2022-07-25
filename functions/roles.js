const GuildRoles = require('../database/guildRoles')
const User = require('../database/user')
const Player = require('./player')

const updateRoles = async (client, discordId, guildId, remove = false) => {
  let users = await User.getAll()
  let guilds = await GuildRoles.getAll()
  if (discordId) users = [await User.get(discordId)]
  if (guildId) guilds = [await GuildRoles.getRolesOf(guildId)]

  const clientGuilds = await client.guilds.fetch()

  clientGuilds.forEach(async (guild) => {
    const guildRoles = guilds.find(e => e.id === guild.id)
    if (!guildRoles) return

    const guildDatas = await guild.fetch()

    guildDatas.members.fetch({ user: users.map(e => e.discordId) })
      .then(async members => members.forEach(async (member) => {
        const user = await User.get(member.user.id)
        if (!user) return

        const playerDatas = await Player.getDatas(user.faceitId)
        const playerLevel = playerDatas.games.csgo.skill_level
        const roleLevels = Object.keys(Object.entries(guildRoles)[2][1])
          .filter(e => e.startsWith('level')).map(e => guildRoles[e])

        await member.roles.remove(roleLevels).catch(console.error)

        if (remove) {
          User.remove(discordId)
          return
        }

        const roleToAdd = roleLevels[playerLevel - 1]
        const rolesFit = member.roles.resolve()
        if (rolesFit) return

        await member.roles.add(roleToAdd).catch(console.error)
      }))
      .catch(console.error)
  })
}

module.exports = {
  updateRoles
}