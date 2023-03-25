const Faceit = require('./faceit')

const getId = async (steamId) => (await Faceit.fetchData(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`, 'error.command.faceitProfileNotFound')).player_id

const getDatas = (playerId) => Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}`, 'error.command.faceitDatasNotFound')

const getStats = (playerId) => Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/stats/csgo`, 'error.command.faceitCsgoStatsNotFound')

const getHistory = (playerId, limit = 1, offset = 0, from = null, to = null) => Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=${offset}&from=${from}&to=${to}&limit=${limit}`, 'error.command.faceitHistoryNotFound')

const getDatasFromNickname = (nickname) => Faceit.fetchData(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, 'error.command.faceitDatasNotFound')

const searchPlayer = (nickname) => Faceit.fetchData(`https://open.faceit.com/data/v4/search/players?nickname=${nickname}&game=csgo&offset=0&limit=1`, 'error.command.faceitProfileNotFound')

module.exports = {
  getDatas,
  getId,
  getStats,
  getHistory,
  getDatasFromNickname,
  searchPlayer
}