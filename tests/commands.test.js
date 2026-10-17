const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load, fakeInteraction } = require('./helpers')

let linkedUser = null

stubModule('database/user.js', { getWithGuild: async () => linkedUser, get: async () => [] })
stubModule('database/team.js', {
  getTeamSlug: async (slug) => ({ slug, name: 'Private team', access: false }),
  getCreatorTeam: async () => null,
})
stubModule('database/userTeam.js', { getTeamUsers: async () => [{ faceitId: 'faceit-member' }] })
stubModule('functions/roles.js', { updateRoles: () => null })

const { getUsers } = load('functions/commands.js')
const { getTranslation } = load('languages/setup.js')

test('a private team is refused to a user who never linked an account', async () => {
  // Payload: "/stats team:private-team" sent by a Discord user without /link
  linkedUser = null

  await assert.rejects(
    getUsers(fakeInteraction({ options: { team: 'private-team' } })),
    (error) => {
      assert.equal(error, getTranslation('error.command.teamNoAccess', 'en-US'))
      return true
    }
  )
})

test('a private team is still available to its members', async () => {
  linkedUser = { faceitId: 'faceit-member', verified: false }

  const users = await getUsers(fakeInteraction({ options: { team: 'private-team' } }))

  assert.deepEqual(users.map(u => u.param), ['faceit-member'])
})
