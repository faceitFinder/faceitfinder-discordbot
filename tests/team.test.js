const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load, fakeInteraction } = require('./helpers')
const { maxLengthTeamName } = require('../config.json')

const updates = []

stubModule('database/team.js', {
  getCreatorTeam: async () => ({ slug: 'old-team', name: 'Old team', access: true }),
  getTeamSlug: async (slug) => slug === 'taken' ? { slug } : null,
  update: (...args) => updates.push(args),
})
stubModule('database/userTeam.js', { updateMany: async () => null, getTeamUsers: async () => [] })
stubModule('database/user.js', {})
stubModule('functions/apiHandler.js', { getStats: async () => ({}) })
stubModule('functions/commands.js', { getCardsConditions: async () => [] })

const team = load('commands/team.js')
const { getTranslation } = load('languages/setup.js')

const description = (card) => card.embeds[0].data.description

test('/team update with a name already used shows the right error', async () => {
  // Payload: "/team update access:true name:taken"
  const card = await team.execute(fakeInteraction({ subcommand: 'update', options: { access: true, name: 'taken' } }))

  assert.equal(description(card), getTranslation('error.command.teamNameAlreadyExist', 'en-US'))
})

test('/team update refuses a name longer than the limit', async () => {
  // Payload: "/team update access:true name:<20 characters>"
  updates.length = 0
  const name = 'x'.repeat(maxLengthTeamName + 6)

  const card = await team.execute(fakeInteraction({ subcommand: 'update', options: { access: true, name } }))

  assert.equal(description(card), getTranslation('error.command.teamNameTooLong', 'en-US'))
  assert.equal(updates.length, 0)
})

test('/team update renames the team', async () => {
  updates.length = 0

  await team.execute(fakeInteraction({ subcommand: 'update', options: { access: false, name: 'New name' } }))

  assert.deepEqual(updates, [['old-team', 'New name', 'new-name', false]])
})
