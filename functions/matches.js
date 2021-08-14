const { default: fetch } = require("node-fetch")

const getMatches = async (playerId, limit = 20) => await fetch(`https://api.faceit.com/stats/api/v1/stats/time/users/${playerId}/games/csgo?size=${limit}`, {
  method: 'GET',
})
  .then(res => {
    if (res.status == 200) return res.json()
    else throw 'An error has occured'
  })
  .then(data => data)

module.exports = {
  getMatches
}