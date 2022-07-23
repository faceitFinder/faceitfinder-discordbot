const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const AntiSpam = require('./templates/antispam')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
<<<<<<< HEAD
const { updateRoles } = require('./functions/roles')
=======
>>>>>>> 32fe027373a465b1df5f9e1024227ea8448436c0

require('dotenv').config()

client.antispam = new AntiSpam()

fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(async (file) => {
  const event = require(`./events/${file}`)
  client.on(event.name, (...args) => { event.execute(...args) })
})

// Start the bot
client.login(process.env.TOKEN)
<<<<<<< HEAD

setInterval(() => { updateRoles(client) }, 3600000)
=======
>>>>>>> 32fe027373a465b1df5f9e1024227ea8448436c0
