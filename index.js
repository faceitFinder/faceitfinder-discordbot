const { prefix } = require('./config.json')
const Discord = require('discord.js')
const { AutoPoster } = require('topgg-autoposter')
const fs = require('fs')
const mongo = require('./database/mongo')
const errorCard = require('./templates/errorCard')
const { guildCount, getApp } = require('./functions/client')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })

require('dotenv').config()

client.on('ready', () => {
  console.log('🚀 Bot started!')
  mongo().then(() => { console.log('🧱 Connected to mongo') }).catch((e) => {
    console.error(e)
  })

  /**
   * Setup commands
   */
  client.commands = new Discord.Collection()
  fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(async (file) => {
    const command = require(`./commands/${file}`)
    command.aliasses.forEach(e => { client.commands.set(e, command) })
  })

  /**
   * Setup selectMenus
   */
  client.selectMenus = new Discord.Collection()
  fs.readdirSync('./interactions/selectmenu').filter(file => file.endsWith('.js')).forEach(menuFileName => {
    const menu = require(`./interactions/selectmenu/${menuFileName}`)
    client.selectMenus.set(menu.name, menu)
  })

  guildCount(client)
})

client.on('messageCreate', async message => {
  if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return
  else {
    const msg = message.content.slice(prefix.length).trim()
    const args = msg.split(/ +/)
    const command = args.shift().toLowerCase()

    if (!client.commands.has(command)) message.channel.send(errorCard('**Command not found**'))
    else try { await client.commands.get(command).execute(message, args) }
    catch (error) {
      console.log(error)
      message.channel.send(errorCard('**An error has occured**'))
    }
  }
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isSelectMenu()) client.selectMenus.get(interaction.customId)?.execute(interaction)
})

// Send datas to top.gg
if (process.env.TOPGG_TOKEN) AutoPoster(process.env.TOPGG_TOKEN, client).on('posted', () => { guildCount(client) })

// Start the bot
client.login(process.env.TOKEN)
