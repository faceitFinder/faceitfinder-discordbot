const { test } = require('node:test')
const assert = require('node:assert/strict')
const axios = require('axios')
const { load } = require('./helpers')

// Nothing listens on this port: the API is down
process.env.API_URL = 'http://127.0.0.1:9'

const { getStats, getFind, getLadder } = load('functions/apiHandler.js')

const quiet = async (fn) => {
  const originalError = console.error
  console.error = () => null
  try {
    return await fn()
  } finally {
    console.error = originalError
  }
}

test('getStats reports an unreachable API instead of crashing', async () => {
  // Payload: "/stats faceit_parameters:justdams" while the API container is down
  await quiet(() => assert.rejects(getStats({ playerParam: { param: 'justdams' } }), (error) => {
    assert.ok(!(error instanceof TypeError), `unexpected ${error}`)
    assert.equal(error, 'error.execution.command')
    return true
  }))
})

test('getLadder still returns N/A when the API is unreachable', async () => {
  const ladder = await quiet(() => getLadder({ playerParam: { param: 'justdams' }, region: 'EU' }))

  assert.deepEqual(ladder, { position: 'N/A' })
})

test('player parameters are encoded in the API query string', async () => {
  // Payload: "/stats faceit_parameters:a&game=csgo" (a nickname containing & or #)
  const urls = []
  axios.defaults.adapter = async (config) => {
    urls.push(config.url)
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }

  await getStats({ playerParam: { param: 'a&game=csgo#x' } })
  await getFind({ playerParam: { param: 'me' }, faceitIncluded: ['b&c'], steamExcluded: ['https://steamcommunity.com/id/d?e'] })

  const stats = new URL(urls[0])
  assert.equal(stats.searchParams.get('faceit'), 'a&game=csgo#x')
  assert.equal(stats.searchParams.getAll('game').length, 1)

  const find = new URL(urls[1])
  assert.deepEqual(find.searchParams.getAll('faceitIncluded'), ['b&c'])
  assert.deepEqual(find.searchParams.getAll('steamExcluded'), ['https://steamcommunity.com/id/d?e'])
})
