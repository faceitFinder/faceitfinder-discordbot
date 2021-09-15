const { prefix } = require('../config.json')

const guildCount = (client) => {
  const Guilds = client.guilds.cache.map(guild => guild.id)
  client.user.setActivity(`${prefix}help | ${Guilds.length} servers`, { type: 'PLAYING' })
}

module.exports = {
  guildCount,
}