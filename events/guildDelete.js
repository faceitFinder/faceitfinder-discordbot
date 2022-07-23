<<<<<<< HEAD
const GuildRoles = require('../database/guildRoles')
=======
>>>>>>> 32fe027373a465b1df5f9e1024227ea8448436c0
const { guildCount } = require('../functions/client')

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    guildCount(guild.client)
<<<<<<< HEAD
    await GuildRoles.remove(guild.id)
=======
>>>>>>> 32fe027373a465b1df5f9e1024227ea8448436c0
  }
}