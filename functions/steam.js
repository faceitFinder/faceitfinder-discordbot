const fetch = require('node-fetch')

require('dotenv').config()


const getId = async (arg) => {
  return await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_TOKEN}&vanityurl=${arg}`)
    .then(res => {
      if (res.status == 200) return res.json()
      else throw 'An error has occured'
    })
    .then(data => {
      if (data.response.success == 1) return data.response.steamid
      else return arg
    })
}



module.exports = {
  getId
}