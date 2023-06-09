const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const AntiSpam = require('./templates/antispam')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] })
const { updateRoles } = require('./functions/roles')

client.antispam = new AntiSpam()

fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(async (file) => {
  const event = require(`./events/${file}`)
  client.on(event.name, (...args) => { event.execute(...args) })
})

// Start the bot
client.login(process.env.TOKEN)

setInterval(() => { updateRoles(client) }, 3600000)
