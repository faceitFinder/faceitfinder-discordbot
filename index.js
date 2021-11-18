const Discord = require('discord.js')
const { AutoPoster } = require('topgg-autoposter')
const { guildCount } = require('./functions/client')
const fs = require('fs')
const AntiSpam = require('./templates/antispam')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })

require('dotenv').config()

client.antispam = new AntiSpam()

fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(async (file) => {
  const event = require(`./events/${file}`)
  client.on(event.name, (...args) => { event.execute(...args) })
})

// Send datas to top.gg
if (process.env.TOPGG_TOKEN) AutoPoster(process.env.TOPGG_TOKEN, client).on('posted', () => { guildCount(client) })

// Start the bot
client.login(process.env.TOKEN)
