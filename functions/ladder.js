const Faceit = require('./faceit')

const getDatas = async (playerId, country) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/rankings/games/csgo/regions/EU/players/${playerId}?limit=1${country ? `&country=${country}` : ''}`)
  return data
}

module.exports = {
  getDatas,
}