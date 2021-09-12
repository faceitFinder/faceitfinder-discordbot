const { prefix } = require('../config.json')

const getApp = (client, guildId) => {
  const app = client.api.applications(client.user.id)
  if (guildId) app.guilds(guildId)
  return app
}

const guildCount = (client) => {
  const Guilds = client.guilds.cache.map(guild => guild.id)
  client.user.setActivity(`${prefix}help | ${Guilds.length} servers`, { type: 'PLAYING' })
}

module.exports = {
  getApp,
  guildCount,
}