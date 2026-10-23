const express = require('express')
const { updateRoles } = require('./roles')

/**
 * Guilds owned by the shards of this client. A shard also caches the guilds of other shards it fetched
 * (roles updates), so the cache alone would report those guilds twice.
 */
const ownGuilds = (client) => [...client.guilds.cache.values()]
  .filter(guild => !client.shard || client.shard.ids.includes(guild.shardId))

/**
 * In production every shard is a separate process and its client only caches the guilds of that shard:
 * gather the guilds of all shards. If a shard cannot answer, fall back to the guilds of this one.
 */
const getAllGuilds = async (client) => {
  if (!client.shard) return ownGuilds(client)

  try {
    const guildsByShard = await client.shard.broadcastEval(c => [...c.guilds.cache.values()]
      .filter(guild => c.shard.ids.includes(guild.shardId))
      .map(guild => guild.toJSON()))
    // A guild moved between shards (resharding) may still be in two caches
    return [...new Map(guildsByShard.flat().map(guild => [guild.id, guild])).values()]
  } catch (error) {
    console.error('Unable to fetch the guilds of every shard:', error)
    return ownGuilds(client)
  }
}

/**
 * Bot API, started by a single shard (see the clientReady handler of bot.js).
 */
const createApi = (client) => {
  const app = express()

  app.put('/users/:id/roles', async (req, res) => {
    const { id } = req.params
    const { remove } = req.query
    await updateRoles(client, id, null, remove === 'true')

    res.status(200).send()
  })

  app.get('/guilds', async (req, res) => {
    res.status(200).json(await getAllGuilds(client))
  })

  return app
}

module.exports = {
  createApi,
  getAllGuilds,
  ownGuilds,
}
