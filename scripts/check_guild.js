const { Client, GatewayIntentBits } = require('discord.js')
const { updateRoles } = require('../functions/roles')
const mongo = require('../database/mongo')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] })

const guildId = ''
client.login(process.env.TOKEN)

client.on('ready', async () => {
  mongo().then(() => { console.info('🧱 Connected to mongo') }).catch(console.error)

  const guild = await client.guilds.fetch(guildId)

  if (!guild) return
  console.log('Guild found:', guild.name)

  await updateRoles(client, null, guildId)
})
