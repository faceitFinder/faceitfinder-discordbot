const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load } = require('./helpers')

const roleUpdates = []
stubModule('functions/roles.js', { updateRoles: async (...args) => roleUpdates.push(args) })

const { createApi } = load('functions/api.js')

const guild = (id, shardId) => ({ id, name: `Guild ${id}`, shardId, toJSON() { return { id, name: `Guild ${id}`, shardId } } })
const cache = (...guilds) => ({ cache: new Map(guilds.map(g => [g.id, g])) })

// In production the bot runs one process per shard: each client caches the guilds of its shard,
// plus the guilds of other shards it fetched (roles updates)
const shardClients = [
  { guilds: cache(guild('1', 0), guild('2', 0)), shard: { ids: [0] } },
  { guilds: cache(guild('3', 1), guild('1', 0)), shard: { ids: [1] } },
]

const shardedClient = (broadcastEval = async (script) => Promise.all(shardClients.map(c => script(c)))) => ({
  guilds: shardClients[1].guilds,
  shard: { ids: [1], count: 2, broadcastEval },
})

const request = async (client, method, path) => {
  const server = createApi(client).listen(0)
  await new Promise(resolve => server.once('listening', resolve))
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method })
    const text = await res.text()
    return { status: res.status, body: text ? JSON.parse(text) : null }
  } finally {
    server.close()
  }
}

test('GET /guilds returns the guilds of every shard', async () => {
  // Payload: GET /guilds on the bot API in production (2 shards), as done by the webapp /profile/connections page
  const { status, body } = await request(shardedClient(), 'GET', '/guilds')

  assert.equal(status, 200)
  assert.deepEqual(body.map(g => g.id), ['1', '2', '3'])
})

test('GET /guilds does not duplicate a guild cached by another shard', async () => {
  // Guild 1 belongs to shard 0 but shard 1 fetched it for a roles update: it was listed twice
  const { body } = await request(shardedClient(), 'GET', '/guilds')

  assert.equal(body.filter(g => g.id === '1').length, 1)
})

test('GET /guilds does not duplicate a guild reported by two shards', async () => {
  const client = shardedClient(async () => [[{ id: '1', shardId: 0 }], [{ id: '1', shardId: 1 }]])

  const { body } = await request(client, 'GET', '/guilds')

  assert.deepEqual(body.map(g => g.id), ['1'])
})

test('GET /guilds returns the guilds of the client without sharding', async () => {
  const client = { guilds: cache(guild('1', 0), guild('2', 0)), shard: null }

  const { body } = await request(client, 'GET', '/guilds')

  assert.deepEqual(body.map(g => g.id), ['1', '2'])
})

test('GET /guilds still answers when a shard cannot be reached', async () => {
  const client = shardedClient(async () => { throw new Error('Shard 0 is not ready') })
  const originalError = console.error
  console.error = () => null

  const { status, body } = await request(client, 'GET', '/guilds')
  console.error = originalError

  assert.equal(status, 200)
  assert.deepEqual(body.map(g => g.id), ['3'])
})

test('PUT /users/:id/roles still updates the roles', async () => {
  const client = shardedClient(async () => [])

  const { status } = await request(client, 'PUT', '/users/discord-1/roles?remove=true')

  assert.equal(status, 200)
  assert.deepEqual(roleUpdates.at(-1), [client, 'discord-1', null, true])
})
