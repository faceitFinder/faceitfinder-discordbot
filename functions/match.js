const axios = require('axios')
const Faceit = require('./faceit')

const getMatchElo = (playerId, limit = 20, page = 0) => axios.get(`https://api.faceit.com/stats/api/v1/stats/time/users/${playerId}/games/csgo?size=${limit}&page=${page}`)
  .then(res => {
    if (res.status == 200) return res.data
    else {
      console.error(res.statusText, res.url)
      throw 'Couldn\'t get matches'
    }
  })
  .then(data => data)

const getMatchStats = matchid => Faceit.fetchData(`https://open.faceit.com/data/v4/matches/${matchid}/stats`, 'Couldn\'t get matches stats')

module.exports = {
  getMatchElo,
  getMatchStats
}