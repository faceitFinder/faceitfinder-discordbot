const Faceit = require('./faceit')

const generateCanva = (playerId) => {
  const data = await Faceit.fetchData(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=0&limit=5`)
  console.log(data)
}

module.exports = {
  generateCanva
}
