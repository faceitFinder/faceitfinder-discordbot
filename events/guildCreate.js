const { guildCount } = require('../functions/client')

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    guildCount(guild.client)
  }
}