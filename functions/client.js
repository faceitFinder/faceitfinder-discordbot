const { Api } = require('@top-gg/sdk')
const { ActivityType } = require('discord.js')

require('dotenv').config()

const guildCount = (client) => {
  const Guilds = client.guilds.cache.map(guild => guild.id)
  client.user.setActivity(`/help | ${Guilds.length} servers`, { type: ActivityType.Playing })

  // Send datas to top.gg
  if (process.env.TOPGG_TOKEN) {
    const api = new Api(process.env.TOPGG_TOKEN)
    api.postStats({
      serverCount: Guilds.length
    }).catch(console.error)
  }
}

module.exports = {
  guildCount,
}