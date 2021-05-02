const Faceit = require('./faceit')

const getStats = async (matchId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/matches/${matchId}/stats`)
  return data
}

module.exports = {
  getStats
}