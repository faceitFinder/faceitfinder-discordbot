const Faceit = require('./faceit')

const getStats = async (matchId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/matches/${matchId}/stats`)
  console.log(data)
}

module.exports = {
  getStats
}