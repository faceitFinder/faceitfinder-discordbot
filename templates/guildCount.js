const { prefix } = require('../config.json')

module.exports = (client) => {
  const Guilds = client.guilds.cache.map(guild => guild.id)
  client.user.setActivity(`${prefix}help | ${Guilds.length} servers`, { type: 'PLAYING' })
}