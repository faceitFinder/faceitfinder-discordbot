const GuildRoles = require('../database/guildRoles')
const { guildCount } = require('../functions/client')

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    guildCount(guild.client)
    await GuildRoles.remove(guild.id)
  }
}