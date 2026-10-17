const express = require('express')
const { updateRoles } = require('./roles')

/**
 * In production every shard is a separate process and its client only caches the guilds of that shard:
 * gather the guilds of all shards. If a shard cannot answer, fall back to the guilds of this one.
 */
const getAllGuilds = async (client) => {
  const localGuilds = [...client.guilds.cache.values()]
  if (!client.shard) return localGuilds

  try {
    const guildsByShard = await client.shard.fetchClientValues('guilds.cache')
    return guildsByShard.flat()
  } catch (error) {
    console.error('Unable to fetch the guilds of every shard:', error)
    return localGuilds
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
}
