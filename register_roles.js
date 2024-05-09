const axios = require('axios')

const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_CLIENT_ID}/role-connections/metadata`
const body = [
  {
    key: 'faceit_verified',
    name: 'Faceit Account Verified',
    description: 'This role is given to users who have connected their Faceit account on faceitfinder.app',
    type: 7
  }
]

axios.put(url, body, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${process.env.TOKEN}`,
  },
}).then((res) => {
  console.log(res.data)
}).catch((err) => {
  console.error(err)
})