const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const express = require('express')
const AntiSpam = require('./templates/antispam')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] })
const { updateRoles, updateSubscribedGuilds } = require('./functions/roles')
const { guildCount } = require('./functions/client')

client.antispam = new AntiSpam()

fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(async (file) => {
  const event = require(`./events/${file}`)
  client.on(event.name, (...args) => { event.execute(...args) })
})

client.once('ready', async (client) => {
  if (client.shard.ids[0] !== client.shard.count - 1) return

  /**
   * Initialize the automatic role assignment
   */
  setInterval(() => {
    updateSubscribedGuilds(client)
  }, 1000 * 60 * 60)

  /**
   * Update the guild count
   */
  guildCount(client)

  // start the API
  const app = express()
  const PORT = process.env.EXPRESS_PORT || 3001

  app.put('/users/:id/roles', async (req, res) => {
    const { id } = req.params
    const { remove } = req.query
    await updateRoles(client, id, null, remove === 'true')

    res.status(200).send()
  })

  app.get('/guilds', async (req, res) => {
    const guilds = client.guilds.cache
    res.status(200).json(guilds)
  })

  app.listen(PORT, () => {
    console.log(`🐉 API server is running on port ${PORT}`)
  })
})

// Start the bot
client.login(process.env.TOKEN)

const shutdown = async () => {
  console.log(`Shard ${client.shard?.ids[0] ?? '0'} is shutting down...`)
  await client.destroy()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGUSR2', shutdown)
