/* eslint-disable camelcase -- keys mirror the API payload */
const { test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load, fakeInteraction } = require('./helpers')
const { itemByPage } = require('../config.json')

const day = 86_400_000
let calls = []
let options = []
let history = []

// GET /api/stats/<matchNumber>: the latest matches, plus the match before them without map filter.
// With dates (the card of a period): the matches of the period.
stubModule('functions/apiHandler.js', {
  getStats: async (params) => {
    calls.push(params)
    const playerDatas = { player_id: 'player-1', nickname: 'Player', games: {} }
    if (params.startDate) {
      const period = history.filter(m => m.date >= params.startDate && m.date < params.endDate)
      return { playerDatas, playerHistory: period, playerLastStats: {} }
    }
    const matches = history.filter(m => !params.map || m.map === params.map)
    return { playerDatas, playerHistory: matches.slice(0, params.matchNumber + (params.map ? 0 : 1)) }
  },
  getSeasons: async () => null,
})
stubModule('functions/utility.js', {
  generateOption: async (_interaction, option) => {
    options.push(option)
    return { label: option.label, value: `option-${options.length}`, description: option.description }
  },
  setOptionDefault: (option) => option,
  getInteractionOption: () => null,
  getCurrentEloString: () => '',
  getGameOption: () => 'cs2',
})
stubModule('functions/customType.js', { buildButtonsGraph: async () => [] })
stubModule('functions/pagination.js', { getPagination: async (_i, page, maxPage) => ({ pagination: { page, maxPage } }) })
stubModule('functions/graph.js', { generateChart: () => Buffer.from(''), getRankImage: async () => Buffer.from('') })

const DateStats = load('functions/dateStats.js')

// Same period functions as commands/dailystats.js and commands/yearstats.js
const getDay = (date) => new Date(date).setHours(0, 0, 0, 0)
const dayRange = (date) => ({ from: new Date(date.date).getTime(), to: new Date(date.date).setHours(24) })
const getYear = (date) => {
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  date.setDate(1)
  date.setMonth(0)
  return date.getTime()
}
const yearRange = (date) => {
  const to = new Date(date.date)
  to.setHours(24)
  to.setMonth(12)
  to.setDate(1)
  return { from: new Date(date.date).getTime(), to: to.getTime() }
}

// Days are local: a 20:00 time shifted by 24 h steps stays on the right day across DST
const latest = getDay(Date.parse('2026-11-10T00:00:00')) + 20 * 3_600_000

/**
 * `playedDays` days played, newest first, one day out of three (two empty days between them),
 * `perDay` matches each.
 */
const makeHistory = (playedDays, perDay = 2) => Array.from({ length: playedDays * perDay }, (_, i) => {
  const dayIndex = Math.floor(i / perDay)
  return { matchId: `m${i}`, date: latest - dayIndex * 3 * day - (i % perDay) * 3_600_000, map: i % 2 ? 'de_mirage' : 'de_inferno' }
})
const playedDay = (index) => getDay(latest - index * 3 * day)

const generate = (page, functionToGetDates = getDay, formatFromToDates = dayRange, map = '') => DateStats.generateDatasForCard({
  interaction: fakeInteraction(),
  playerParam: { param: 'player-1', faceitId: true },
  page,
  game: 'cs2',
  map,
  functionToGetDates,
  formatFromToDates,
  formatLabel: (from) => new Date(from).toDateString(),
  selectTranslationString: 'strings.selectDate',
})
const listCalls = () => calls.filter(c => !c.startDate)

beforeEach(() => {
  calls = []
  options = []
  history = makeHistory(120)
})

test('/dailystats lists 25 played days, without the empty days between them', async () => {
  // Payload: "/dailystats" for a player who plays one day out of three
  await generate(0)

  assert.deepEqual(options.map(o => o.values.from), Array.from({ length: itemByPage }, (_, i) => playedDay(i)))
  assert.ok(options.every(o => /2/.test(o.description)))
  // 100 latest matches = 50 played days: enough for the page, one request
  assert.deepEqual(listCalls().map(c => c.matchNumber), [100])
})

test('a later page asks for more matches at once', async () => {
  // Payload: "page 3" on /dailystats: played days 75 to 99
  const resp = await generate(3)

  assert.deepEqual(options.map(o => o.values.from), Array.from({ length: itemByPage }, (_, i) => playedDay(75 + i)))
  assert.deepEqual(listCalls().map(c => c.matchNumber), [400])
  assert.equal(resp.components.at(-1).pagination.page, 3)
})

test('more matches are asked when the ones read do not fill the page', async () => {
  // 5 matches a day: the 100 latest matches only hold 20 played days
  history = makeHistory(60, 5)
  await generate(0)

  assert.equal(options.length, itemByPage)
  assert.deepEqual(listCalls().map(c => c.matchNumber), [100, 200])
})

test('the last page is known once the whole history was read', async () => {
  history = makeHistory(60)
  // Payload: "/dailystats" then "last page": 60 played days = 3 pages
  const first = await generate(0)
  assert.equal(first.components.at(-1).pagination.maxPage, 1) // 50 days read so far: at least one more page

  options = []
  const last = await generate(2)
  assert.equal(last.components.at(-1).pagination.maxPage, 2)
  assert.equal(options.length, 10)
  assert.equal(options.at(-1).values.from, playedDay(59))
})

test('a page past the end shows the last page', async () => {
  history = makeHistory(30)
  const resp = await generate(5)

  assert.equal(resp.components.at(-1).pagination.page, 1)
  assert.equal(options.length, 5)
})

test('the last day of a page is complete when it spans two rounds of matches', async () => {
  // 4 matches a day: the 100 latest matches end in the middle of the 25th played day
  history = makeHistory(40, 4)
  await generate(0)

  assert.equal(options.length, itemByPage)
  assert.ok(options.every(o => /4/.test(o.description)))
})

test('/yearstats reads the history until its end', async () => {
  history = makeHistory(400, 1) // ~3.3 years
  await generate(0, getYear, yearRange)

  assert.ok(options.length >= 3)
  assert.equal(options.reduce((sum, o) => sum + Number(o.description.match(/\d+/)[0]), 0), 400)
})

test('a map filter only counts the matches on that map', async () => {
  await generate(0, getDay, dayRange, 'de_mirage')

  assert.equal(options.length, itemByPage)
  assert.ok(options.every(o => /1/.test(o.description)))
  assert.ok(listCalls().every(c => c.map === 'de_mirage'))
})

test('no match at all is reported', async () => {
  history = []
  await assert.rejects(generate(0), (error) => typeof error === 'string')
  assert.equal(calls.length, 1)
})
