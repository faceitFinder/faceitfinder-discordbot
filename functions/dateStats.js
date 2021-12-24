const Match = require('./match')

const getDates = async (playerId, maxMatch, getDay) => {
  const dates = new Map()
  await Match.getMatchElo(playerId, maxMatch)
    .then(m => m.forEach(e => {
      const day = getDay(e.date)
      if (!dates.has(day)) dates.set(day, { number: 1, date: day })
      else dates.set(day, { number: dates.get(day).number + 1, date: day })
    }))

  return dates
}

module.exports = {
  getDates
}