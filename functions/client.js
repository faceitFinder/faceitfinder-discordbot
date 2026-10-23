const { Api } = require('@top-gg/sdk')

const guildCount = async (client) => {
  // Only the guilds owned by each shard: a shard also caches the guilds of other shards it fetched
  const guildsSize = client.shard
    ? await client.shard.broadcastEval(c => [...c.guilds.cache.values()].filter(guild => c.shard.ids.includes(guild.shardId)).length)
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
    api.postMetrics({
      serverCount: guildsSize,
      shardCount: client.shard ? client.shard.count : 1,
    }).catch(console.error)
  }
}

module.exports = {
  guildCount,
}