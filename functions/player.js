const Faceit = require('./faceit')

const getId = async (steamId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`)
  return data.player_id
}

const getDatas = async (playerId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}`)
  return data
}

const getStats = async (playerId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/stats/csgo`)
  return data
}

module.exports = {
  getDatas,
  getId,
  getStats
}