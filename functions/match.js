const { default: fetch } = require('node-fetch')
const Faceit = require('./faceit')

const getMatchElo = (playerId, limit = 20, page = 0) => fetch(`https://api.faceit.com/stats/api/v1/stats/time/users/${playerId}/games/csgo?size=${limit}&page=${page}`, {
  method: 'GET',
})
  .then(res => {
    if (res.status == 200) return res.json()
    else throw 'Couldn\'t get last matchs'
  })
  .then(data => data)

const getMatchStats = matchid => Faceit.fetchData(`https://open.faceit.com/data/v4/matches/${matchid}/stats`, 'Couldn\'t get matches stats')

module.exports = {
  getMatchElo,
  getMatchStats
}