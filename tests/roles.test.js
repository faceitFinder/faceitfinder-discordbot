/* eslint-disable camelcase -- keys mirror the API payload and the Discord option names */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { Types } = require('mongoose')
const { stubModule, load, flush } = require('./helpers')

const GUILD_ID = 'guild-premium'
const roleChanges = []

stubModule('database/guildCustomRole.js', {
  getRolesOf: async () => [{ guildId: GUILD_ID, roleId: 'custom-role', eloMin: 0, eloMax: 5000 }],
  getAll: async () => [],
})
stubModule('database/guildRoles.js', { getRolesOf: async () => null })
stubModule('database/user.js', {
  get: async (discordId) => [{ discordId, faceitId: 'faceit-1', guildId: null }],
  remove: async () => null,
})
stubModule('functions/apiHandler.js', {
  getStats: async () => ({ playerDatas: { nickname: 'player', games: { cs2: { faceit_elo: 1200 } } } }),
})

const { updateRoles, getRoleIds } = load('functions/roles.js')
const GuildRolesModel = load('database/models/guildRolesModel.js')

const member = {
  id: 'member-1',
  nickname: null,
  user: { id: 'member-1', username: 'member', tag: 'member#0', bot: false },
  roles: {
    cache: [],
    add: async (roleId) => roleChanges.push(['add', roleId]),
    remove: async (roleId) => roleChanges.push(['remove', roleId]),
  },
}

const guild = {
  id: GUILD_ID,
  name: 'Premium guild',
  members: { fetch: async (arg) => typeof arg === 'string' ? member : [member] },
  channels: { fetch: async () => ({ send: async () => null }) },
}

// Guild with an active guild subscription (premium)
const client = {
  shard: null,
  entitlements: [{ guildId: GUILD_ID, isActive: () => true, isGuildSubscription: () => true }],
  guilds: { fetch: async () => guild },
}

test('premium guilds get their custom elo roles', async () => {
  // Payload: "/roles setup_elo role_name:Custom role_color:#ff0000 elo_min:0 elo_max:5000" on a premium guild,
  // then any role refresh (updateRoles(client, null, guildId))
  const originalWarn = console.warn
  console.warn = () => null
  updateRoles(client, null, GUILD_ID)
  await flush()
  console.warn = originalWarn

  assert.deepEqual(roleChanges, [['add', 'custom-role']])
})

test('getRoleIds maps every level to its own role when a level is missing', () => {
  // Payload: "/roles generate" when Discord refused to create the "Level 2" role
  const guildRoles = GuildRolesModel.hydrate({ _id: new Types.ObjectId(), id: GUILD_ID, level1: 'r1', level3: 'r3', level10: 'r10' })

  const roleIds = getRoleIds(guildRoles)

  assert.equal(roleIds.length, 10)
  assert.equal(roleIds[0], 'r1')
  assert.equal(roleIds[1], undefined)
  assert.equal(roleIds[2], 'r3')
  assert.equal(roleIds[9], 'r10')
})

test('getRoleIds accepts a plain object', () => {
  const roleIds = getRoleIds({ id: GUILD_ID, level1: 'r1', level2: 'r2' })

  assert.deepEqual(roleIds.slice(0, 2), ['r1', 'r2'])
})
