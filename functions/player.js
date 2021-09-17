const Faceit = require('./faceit')

const getId = async (steamId) => (await Faceit.fetchData(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`, 'Faceit profile not found')).player_id

const getDatas = async (playerId) => await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}`, 'Couldn\'t get faceit datas')

const getStats = async (playerId) => await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/stats/csgo`, 'Couldn\'t get faceit csgo stats')

const getHistory = async (playerId, limit = 1) => await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=0&limit=${limit}`, 'Couldn\'t get csgo history')

module.exports = {
  getDatas,
  getId,
  getStats,
  getHistory
}