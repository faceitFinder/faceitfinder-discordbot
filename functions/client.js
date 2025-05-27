const { Api } = require('@top-gg/sdk')
const { ActivityType } = require('discord.js')

const guildCount = async (client) => {
  const guildsSize = await client.shard.fetchClientValues('guilds.cache.size')
    .then(results => results.reduce((acc, guildCount) => acc + guildCount, 0))

  await client.shard.broadcastEval((c, guildsSize) => {
    c.user.setActivity(`/help | ${guildsSize} Guilds`, { type: 4 })
  }, { context: guildsSize })

  // Send datas to top.gg
  if (process.env.TOPGG_TOKEN) {
    const api = new Api(process.env.TOPGG_TOKEN)
    api.postStats({
      serverCount: guildsSize,
    }).catch(console.error)
  }
}

module.exports = {
  guildCount,
}