const fetch = require('node-fetch')

require('dotenv').config()

const generateCanva = (playerId) => {
  fetch(`https://open.faceit.com/data/v4/players/${playerId}/history?game=csgo&offset=0&limit=5`, {
    method: 'GET',
    headers: headerFaceit
  })
    .then(res => {
      if (res.status == 200) return res.json()
      else throw 'An error has occured'
    })
    .then(data => {
      console.log(data)
    })
}

module.exports = {
  generateCanva
}
