const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load, fakeInteraction } = require('./helpers')
const { color, defaultGame } = require('../config.json')

const created = { guildRoles: null, customRoles: [] }

stubModule('database/guildRoles.js', {
  getRolesOf: async () => null,
  remove: async () => null,
  create: (...args) => { created.guildRoles = args },
})
stubModule('database/guildCustomRole.js', {
  create: (guildId, roleId, eloMin, eloMax) => created.customRoles.push({ roleId, eloMin, eloMax }),
  remove: async () => null,
})
stubModule('functions/roles.js', { updateRoles: async () => null, getRoleIds: () => [] })

const roles = load('commands/roles.js')

test('/roles generate keeps each role on its level when Discord refuses one role', async () => {
  // Payload: "/roles generate" on a guild where creating "Level 7" fails (e.g. 250 roles limit reached)
  const interaction = fakeInteraction({ subcommand: 'generate' })
  const permissions = { has: () => true }
  interaction.member = { permissions, guild: { members: { me: { permissions } } } }
  interaction.guild.roles = {
    create: async ({ name }) => {
      if (name === 'Level 7') throw new Error('Maximum number of guild roles reached (250)')
      return { id: `role-${name.split(' ')[1]}` }
    },
  }

  const originalError = console.error
  console.error = () => null
  await roles.execute(interaction)
  console.error = originalError

  const [, ...levels] = created.guildRoles
  assert.equal(levels[5], 'role-6')
  assert.equal(levels[6], undefined)
  assert.equal(levels[7], 'role-8')

  const role8 = created.customRoles.find(r => r.roleId === 'role-8')
  assert.equal(role8.eloMin, color.levels[defaultGame][8].min)
  assert.equal(role8.eloMax, color.levels[defaultGame][8].max)
})
