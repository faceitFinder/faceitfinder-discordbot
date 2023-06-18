const GuildRoles = require('../database/guildRoles')
const GuildCustomRole = require('../database/guildCustomRole')
const { guildCount } = require('../functions/client')

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    guildCount(guild.client)
    await GuildRoles.remove(guild.id).catch(console.error)
    await GuildCustomRole.removeAll(guild.id).catch(console.error)
  }
}