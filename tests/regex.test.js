const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('./helpers')

const { findSteamUIds } = load('functions/regex.js')

// SteamID64 = 76561197960265728 + Z * 2 + Y for STEAM_X:Y:Z
const STEAM_ID_64 = '76561197960290419'

test('STEAM_0 ids give the right SteamID64', () => {
  // Payload: "/stats steam_parameters:STEAM_0:1:12345"
  assert.deepEqual(findSteamUIds('STEAM_0:1:12345'), [STEAM_ID_64])
})

test('STEAM_1 ids give the right SteamID64', () => {
  assert.deepEqual(findSteamUIds('STEAM_1:1:12345'), [STEAM_ID_64])
})

test('ids are extracted from a pasted status output', () => {
  const status = '# 2 "player" STEAM_1:0:1 01:00 50 0 active\n# 3 "other" STEAM_0:1:12345 01:00 50 0 active'

  assert.deepEqual(findSteamUIds(status), ['76561197960265730', STEAM_ID_64])
})
