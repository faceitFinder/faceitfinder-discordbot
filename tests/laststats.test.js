/* eslint-disable camelcase -- keys mirror the API payload and the Discord option names */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { stubModule, load, fakeInteraction } = require('./helpers')
const { defaultMatchNumber } = require('../config.json')

let fromTo = { from: 0, to: 0, allSeason: false }
let cardValues = null

stubModule('functions/dateStats.js', {
  getFromTo: async () => fromTo,
  getCardWithInfo: async ({ values }) => {
    cardValues = { ...values }
    return { from: values.from, to: values.to }
  },
})
stubModule('functions/apiHandler.js', { getStats: async () => ({ playerDatas: { player_id: 'player-1' } }) })
stubModule('functions/customType.js', { buildButtonsGraph: async () => [] })

const { sendCardWithInfo } = load('commands/laststats.js')
const playerParam = { param: 'player-1', faceitId: true }

test('/laststats uses the match_number option', async () => {
  // Payload: "/laststats match_number:5"
  fromTo = { from: 0, to: 0, allSeason: false }

  await sendCardWithInfo(fakeInteraction({ options: { match_number: 5 } }), playerParam)

  assert.equal(cardValues.maxMatch, 5)
})

test('/laststats keeps match_number when a season is selected', async () => {
  // Payload: "/laststats match_number:5 season:9"
  fromTo = { from: 1, to: 2, allSeason: true }

  await sendCardWithInfo(fakeInteraction({ options: { match_number: 5, season: 9 } }), playerParam)

  assert.equal(cardValues.maxMatch, 5)
})

test('/laststats uses every match of the season without match_number', async () => {
  // Payload: "/laststats season:9"
  fromTo = { from: 1, to: 2, allSeason: true }

  await sendCardWithInfo(fakeInteraction({ options: { season: 9 } }), playerParam)

  assert.equal(cardValues.maxMatch, 0)
})

test('/laststats falls back to the default match number', async () => {
  // Payload: "/laststats"
  fromTo = { from: 0, to: 0, allSeason: false }

  await sendCardWithInfo(fakeInteraction(), playerParam)

  assert.equal(cardValues.maxMatch, defaultMatchNumber)
})
