const { getPlayerHistory } = require('../functions/dateStats')

const findPlayersStats = async (playerId, players, excludedPlayers, maxMatch = null) => {
  const playerHistoryMatches = (await getPlayerHistory(playerId, maxMatch, false))
    .filter(m => players.every(p => m.playing_players.includes(p)) && !excludedPlayers.some(p => m.playing_players.includes(p)))

  const matchIds = playerHistoryMatches.map(e => e.match_id)

  let playerHistory = (await getPlayerHistory(playerId, maxMatch))
    .filter(m => matchIds.includes(m.matchId))

  playerHistory = playerHistory.map((e, i, a) => {
    e.elo = isNaN(e.elo) ? a[i - 1]?.elo ?? undefined : e.elo
    return e
  })

  return playerHistory
}

module.exports = {
  findPlayersStats
}