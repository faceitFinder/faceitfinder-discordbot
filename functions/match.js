const axios = require('axios')
const Faceit = require('./faceit')

const getMatchElo = (playerId, limit = 20, page = 0) => axios.get(`https://api.faceit.com/stats/api/v1/stats/time/users/${playerId}/games/csgo?size=${limit}&page=${page}`)
  .then(res => res.data)
  .catch(e => {
    console.error(e.response.status, e.response.statusText, playerId)
    throw 'Couldn\'t get matches'
  })

const getMatchStats = matchid => Faceit.fetchData(`https://open.faceit.com/data/v4/matches/${matchid}/stats`, 'Couldn\'t get matches stats')

module.exports = {
  getMatchElo,
  getMatchStats
}