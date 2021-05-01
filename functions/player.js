const fetch = require('node-fetch')
const Game = require('./game')

require('dotenv').config()

const headerFaceit = {
  Authorization: `Bearer ${process.env.FACEIT_TOKEN}`
}

const getId = async (steamId) => {
  return await fetch(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`, {
    method: 'GET',
    headers: headerFaceit
  })
    .then(res => {
      if (res.status == 200) return res.json()
      else throw 'An error has occured'
    })
    .then(data => {
      return data.player_id
    })
}

const getDatas = async (playerId) => {
  return await fetch(`https://open.faceit.com/data/v4/players/${playerId}`, {
    method: 'GET',
    headers: headerFaceit
  })
    .then(res => {
      if (res.status == 200) return res.json()
      else throw 'An error has occured'
    })
    .then(data => {
      return data
    })
}

const getHistory = async (playerId) => {
  return await fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=0&limit=5`, {
    method: 'GET',
    headers: headerFaceit
  })
    .then(res => {
      if (res.status == 200) return res.json()
      else throw 'An error has occured'
    })
    .then(data => {
      data.items.forEach(g => {
        Game.getElo(g.game_id, g.region, playerId)
        console.log(g)
      })
    })
}

module.exports = {
  getDatas,
  getHistory,
  getId
}