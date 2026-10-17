const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load } = require('./helpers')

const roleUpdates = []
stubModule('functions/roles.js', { updateRoles: async (...args) => roleUpdates.push(args) })

const { createApi } = load('functions/api.js')

const guild = (id) => ({ id, name: `Guild ${id}` })

// In production the bot runs one process per shard: each client only caches the guilds of its shard
const shardedClient = ({ fetchClientValues }) => ({
  guilds: { cache: new Map([['3', guild('3')]]) },
  shard: { ids: [1], count: 2, fetchClientValues },
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
  const client = shardedClient({ fetchClientValues: async () => [[guild('1'), guild('2')], [guild('3')]] })

  const { status, body } = await request(client, 'GET', '/guilds')

  assert.equal(status, 200)
  assert.deepEqual(body.map(g => g.id), ['1', '2', '3'])
})

test('GET /guilds returns the guilds of the client without sharding', async () => {
  const client = { guilds: { cache: new Map([['1', guild('1')], ['2', guild('2')]]) }, shard: null }

  const { body } = await request(client, 'GET', '/guilds')

  assert.deepEqual(body.map(g => g.id), ['1', '2'])
})

test('GET /guilds still answers when a shard cannot be reached', async () => {
  const client = shardedClient({ fetchClientValues: async () => { throw new Error('Shard 0 is not ready') } })
  const originalError = console.error
  console.error = () => null

  const { status, body } = await request(client, 'GET', '/guilds')
  console.error = originalError

  assert.equal(status, 200)
  assert.deepEqual(body.map(g => g.id), ['3'])
})

test('PUT /users/:id/roles still updates the roles', async () => {
  const client = shardedClient({ fetchClientValues: async () => [] })

  const { status } = await request(client, 'PUT', '/users/discord-1/roles?remove=true')

  assert.equal(status, 200)
  assert.deepEqual(roleUpdates.at(-1), [client, 'discord-1', null, true])
})
