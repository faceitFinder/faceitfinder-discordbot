const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const express = require('express')
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

// start the API
const app = express()
const PORT = process.env.EXPRESS_PORT || 3001

app.put('/users/:id/roles', async (req, res) => {
  const { id } = req.params
  const { remove } = req.query
  console.log(remove)
  await updateRoles(client, id, null, remove === 'true')

  res.status(200).send()
})

app.listen(PORT, () => {
  console.log(`🐉 API server is running on port ${PORT}`)
})