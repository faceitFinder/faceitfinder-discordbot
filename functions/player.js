const Faceit = require('./faceit')

const getId = async (steamId) => (await Faceit.fetchData(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`)).player_id

const getDatas = async (playerId) => await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}`)

const getStats = async (playerId) => await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/stats/csgo`)

module.exports = {
  getDatas,
  getId,
  getStats
}