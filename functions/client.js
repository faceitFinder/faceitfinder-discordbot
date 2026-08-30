const { Api } = require('@top-gg/sdk')

const guildCount = async (client) => {
  const guildsSize = client.shard
    ? await client.shard.fetchClientValues('guilds.cache.size')
      .then(results => results.reduce((acc, guildCount) => acc + guildCount, 0))
    : client.guilds.cache.size

  if (client.shard) {
    await client.shard.broadcastEval((c, guildsSize) => {
      c.user.setActivity(`/help | ${guildsSize} Guilds`, { type: 4 })
    }, { context: guildsSize })
  } else {
    client.user.setActivity(`/help | ${guildsSize} Guilds`, { type: 4 })
  }

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