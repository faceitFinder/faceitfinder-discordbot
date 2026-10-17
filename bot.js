const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const AntiSpam = require('./templates/antispam')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] })
const { updateSubscribedGuilds } = require('./functions/roles')
const { createApi } = require('./functions/api')
const { guildCount } = require('./functions/client')

client.antispam = new AntiSpam()

fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(async (file) => {
  const event = require(`./events/${file}`)
  client.on(event.name, (...args) => { event.execute(...args) })
})

client.once('clientReady', async (client) => {
  // Only the last shard runs what follows (API included): when it is ready, every shard has been spawned
  if (client.shard && client.shard.ids[0] !== client.shard.count - 1) return

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
  const PORT = process.env.EXPRESS_PORT || 3001

  createApi(client).listen(PORT, () => {
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
