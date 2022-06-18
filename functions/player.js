const Faceit = require('./faceit')

const getId = async (steamId) => (await Faceit.fetchData(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`, 'Faceit profile not found')).player_id

const getDatas = (playerId) => Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}`, 'Couldn\'t get faceit datas')

const getStats = (playerId) => Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/stats/csgo`, 'Couldn\'t get faceit csgo stats')

const getHistory = (playerId, limit = 1, offset = 0, from = null, to = null) => Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=${offset}&from=${from}&to=${to}&limit=${limit}`, 'Couldn\'t get csgo history')

const getDatasFromNickname = (nickname) => Faceit.fetchData(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, 'Couldn\'t get faceit datas')

module.exports = {
  getDatas,
  getId,
  getStats,
  getHistory,
  getDatasFromNickname
}