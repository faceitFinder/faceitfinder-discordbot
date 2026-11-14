/* eslint-disable camelcase -- keys mirror the Discord API payload */
const { test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { ActionRow } = require('discord.js')
const createComponent = (data) => new ActionRow(data)
const { stubModule, load, fakeInteraction } = require('./helpers')

let deleted = []
let pages = []

stubModule('database/commandsStats.js', { create: () => null })
stubModule('database/interaction.js', { deleteOne: (id) => deleted.push(id) })
stubModule('templates/loadingCard.js', { getCardByUserType: () => null })
const sendCardWithInfo = async (...args) => { pages.push(args); return {} }
stubModule('commands/dailystats.js', { sendCardWithInfo })
stubModule('commands/last.js', { sendCardWithInfo })
stubModule('commands/find.js', { sendCardWithInfo })

// Components as discord.js builds them from a received message (raw API data, no builders)
const selectRow = createComponent({
  type: 1,
  components: [{ type: 3, custom_id: 'dateStatsSelector', options: [
    { label: 'Mon Nov 10 2026', value: 'option-1' },
    { label: 'Fri Nov 07 2026', value: 'option-2' },
  ] }],
})
const buttonRow = (prefix) => createComponent({
  type: 1,
  components: [1, 2].map(i => ({ type: 2, style: 2, custom_id: `${prefix}-${i}`, emoji: { name: 'next' } })),
})
const message = (components) => ({
  components,
  interaction: { commandName: 'dailystats' },
  fetchReference: async () => { throw new Error('no reference') },
})
const json = { type: { name: 'Elo' }, playerId: 'player-1', targetPage: 2, game: 'cs2', map: '' }

beforeEach(() => {
  deleted = []
  pages = []
})

test('pageDS changes page from a message received from Discord', async () => {
  // Payload: click on "next page" under /dailystats
  const pageDS = load('interactions/buttons/pageDS.js')
  await pageDS.execute(fakeInteraction({ extra: { message: message([selectRow, buttonRow('graph'), buttonRow('page')]) } }), json)

  assert.equal(pages.length, 1)
  assert.equal(pages[0][2], 2)
  assert.deepEqual(deleted.filter(id => id.startsWith('option')), ['option-1', 'option-2'])
  assert.ok(deleted.includes('page-1'))
})

test('pageDS changes page from a page without match (pagination row only)', async () => {
  const pageDS = load('interactions/buttons/pageDS.js')
  await pageDS.execute(fakeInteraction({ extra: { message: message([buttonRow('page')]) } }), json)

  assert.equal(pages.length, 1)
  assert.deepEqual(deleted, ['page-1', 'page-2'])
})

for (const [name, rows] of [['pageLast', 2], ['pageFind', 3], ['fUSG', 3]]) {
  test(`${name} reads the options of a message received from Discord`, async () => {
    const button = load(`interactions/buttons/${name}.js`)
    const components = [selectRow, buttonRow('a'), buttonRow('b')].slice(0, rows)
    await button.execute(fakeInteraction({ extra: { message: message(components) } }), json)

    assert.equal(pages.length, 1)
    assert.ok(deleted.includes('option-1'))
  })
}
