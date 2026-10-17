const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load, fakeInteraction } = require('./helpers')

let seasons = null

stubModule('functions/apiHandler.js', {
  getStats: async () => ({}),
  getSeasons: async () => seasons,
})

const { generateDateStatsFields, getFromTo } = load('functions/dateStats.js')

// playerLastStats as returned by GET /api/stats when no match of the range has an elo
// and the player did not die (old API: Highest/Lowest Elo = -Infinity/Infinity, kd = Infinity, serialized as null)
const playerLastStats = {
  games: 1, wins: 1, winrate: 100, eloGain: 0, kd: null, kills: 15, deaths: 0,
  'Highest Elo': null, 'Lowest Elo': null, 'Current Elo': 1500, eloToPrev: 10, eloToNext: 20,
  'Average MVPs': 3, 'Average K/D': 1.5, 'Average K/R': 0.8, 'Average HS': 50,
  'Average Kills': 15, 'Average Deaths': 0, 'Average Assists': 2, 'Average ADR': 90,
  'Red K/D': 0, 'Orange K/D': 0, 'Green K/D': 1,
}

test('date stats card does not crash on missing elo / K/D values', () => {
  // Payload: "/laststats from_date:2026-01-01 to_date:2026-01-02" on a range without elo data
  const fields = generateDateStatsFields(playerLastStats, [])

  assert.equal(fields.find(f => f.name === 'Highest Elo').value, 'N/A')
  assert.equal(fields.find(f => f.name === 'Lowest Elo').value, 'N/A')
  assert.equal(fields.find(f => f.name === 'K/D').value, 'N/A')
})

test('an unknown season is reported instead of crashing', async () => {
  // Payload: "/laststats game:cs2 season:9" while the seasons list does not contain season 9 yet
  seasons = { payload: { cs2: { seasons: [{ number: 8, from: '2025-06-01', to: '2025-12-31' }] } } }

  await assert.rejects(getFromTo(fakeInteraction({ options: { game: 'cs2', season: 9 } })), (error) => {
    assert.equal(typeof error, 'string')
    return true
  })
})

test('a season list that could not be loaded is reported instead of crashing', async () => {
  // Payload: "/laststats game:cs2 season:9" while GET /api/seasons returns an empty body
  seasons = undefined

  await assert.rejects(getFromTo(fakeInteraction({ options: { game: 'cs2', season: 9 } })), (error) => {
    assert.equal(typeof error, 'string')
    return true
  })
})

test('a known season gives its dates', async () => {
  seasons = { payload: { cs2: { seasons: [{ number: 9, from: '2026-01-01T00:00:00Z', to: '2026-06-01T00:00:00Z' }] } } }

  const { from, to, allSeason } = await getFromTo(fakeInteraction({ options: { game: 'cs2', season: 9 } }))

  assert.equal(from, Date.parse('2026-01-01T00:00:00Z'))
  assert.equal(to, Date.parse('2026-06-01T00:00:00Z'))
  assert.equal(allSeason, true)
})
