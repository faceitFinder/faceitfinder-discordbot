const { prefix, name, color } = require('./config.json')
const Discord = require('discord.js')
const fs = require('fs')
const mongo = require('./database/mongo')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })

require('dotenv').config()

client.on('ready', () => {
  console.log('🚀 Bot started!')
  mongo().then(() => {
    try {
      console.log('🧱 Connected to mongo')
    } catch (e) {
      console.error(e)
    }
  })

  setGuildsNumber()
})

/**
 * Setup commands
 */
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  command.aliasses.forEach(e => {
    client.commands.set(e, command)
  })
}

/**
 * Setup selectMenus
 */
client.selectMenus = new Discord.Collection()
const selectMenus = fs.readdirSync('./interactions/selectmenu').filter(file => file.endsWith('.js'))

for (const menuFileName of selectMenus) {
  const menu = require(`./interactions/selectmenu/${menuFileName}`)
  client.selectMenus.set(menu.name, menu)
}

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return
  else {
    setGuildsNumber()
    const msg = message.content.slice(prefix.length).trim()
    const args = msg.split(/ +/)
    const command = args.shift().toLowerCase()

    if (!client.commands.has(command))
      message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor(color.error)
            .setDescription('**Command not found**')
            .setFooter(`${name} Error`)
        ]
      })
    else {
      try {
        client.commands.get(command).execute(message, args)
      } catch (error) {
        console.log(error)
        message.channel.send({
          embeds: [
            new Discord.MessageEmbed()
              .setColor(color.error)
              .setDescription('**An error has occured**')
              .setFooter(`${name} Error`)
          ]
        })
      }
    }
  }
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isSelectMenu())
    if (client.selectMenus.has(interaction.customId))
      client.selectMenus.get(interaction.customId).execute(interaction)
})

const setGuildsNumber = () => {
  const Guilds = client.guilds.cache.map(guild => guild.id)
  client.user.setActivity(`${prefix}help | ${Guilds.length} servers`, { type: 'PLAYING' })
}

// Start the bot
client.login(process.env.TOKEN)