const { test } = require('node:test')
const assert = require('node:assert')
const { getNextLevel, generateChart } = require('../functions/graph')
const { TYPES } = require('../templates/customType')

test('next level of an elo', () => {
  assert.strictEqual(getNextLevel(1310, 'cs2').level, 7)
  assert.strictEqual(getNextLevel(1310, 'cs2').min, 1351)
  assert.strictEqual(getNextLevel('1350', 'cs2').level, 7)
  assert.strictEqual(getNextLevel(1351, 'cs2').level, 8)
  assert.strictEqual(getNextLevel(100, 'cs2').level, 2)
})

test('no next level after level 10 or without a valid elo', () => {
  assert.strictEqual(getNextLevel(2100, 'cs2'), null)
  assert.strictEqual(getNextLevel(undefined, 'cs2'), null)
  assert.strictEqual(getNextLevel('abc', 'cs2'), null)
  assert.strictEqual(getNextLevel(1310, 'unknown'), null)
})

test('charts are drawn synchronously with and without a next level', () => {
  const history = [1310, 1290, 1300].map((elo, i) => ({ elo: String(elo), eloGain: 10, c2: '1.10', date: Date.UTC(2026, 0, 3 - i) }))
  for (const type of [TYPES.ELO, TYPES.ELO_KD, TYPES.KD]) {
    const buffer = generateChart('en-US', 'test', history, 3, type, 'cs2')
    assert.ok(Buffer.isBuffer(buffer) && buffer.length > 0)
  }
  const top = history.map((match) => ({ ...match, elo: '2100' }))
  assert.ok(Buffer.isBuffer(generateChart('en-US', 'test', top, 3, TYPES.ELO, 'cs2')))
})
