const Faceit = require('./faceit')
const Match = require('./match')

const getId = async (steamId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`)
  return data.player_id
}

const getDatas = async (playerId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}`)
  return data
}

const getHistory = async (playerId) => {
  let data
  let totalGames = 0
  do {
    data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&from=1325376000&offset=${totalGames}&limit=100`)
    totalGames += data.items.length
  } while (data.items.length == 100)
  return { totalGames }
  // data.items.forEach(g => {
  //   Match.getStats(g.match_id)
  // })
}

const getTotalGames = async (playerId) => {

}

module.exports = {
  getDatas,
  getHistory,
  getId
}