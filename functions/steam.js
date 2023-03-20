const axios = require('axios')

require('dotenv').config()

const getId = (arg) => axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_TOKEN}&vanityurl=${arg}`)
  .then(res => {
    if (res.status == 200) return res.data
    else throw res
  })
  .then(data => {
    if (data.response.success == 1) return data.response.steamid
    else return arg
  })

const getDatas = (steamId) => axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_TOKEN}&steamids=${steamId}`)
  .then(res => {
    if (res.status == 200) return res.data
    else throw res
  })
  .then(data => {
    if (data.response.players) return data.response.players[0]
    else throw 'Invalid steamid'
  })

module.exports = {
  getId,
  getDatas
}