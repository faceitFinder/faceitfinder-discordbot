const { default: fetch } = require("node-fetch")
const Faceit = require('./faceit')

const getMatchElo = async (playerId, limit = 20) => await fetch(`https://api.faceit.com/stats/api/v1/stats/time/users/${playerId}/games/csgo?size=${limit}`, {
  method: 'GET',
})
  .then(res => {
    if (res.status == 200) return res.json()
    else throw 'An error has occured'
  })
  .then(data => data)

const getMatchStats = async (matchid) => await Faceit.fetchData(`https://open.faceit.com/data/v4/matches/${matchid}/stats`)

module.exports = {
  getMatchElo,
  getMatchStats
}