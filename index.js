const { prefix } = require('./config.json')
const Discord = require('discord.js')
const { AutoPoster } = require('topgg-autoposter')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs')
const mongo = require('./database/mongo')
const errorCard = require('./templates/errorCard')
const { guildCount } = require('./functions/client')
const AntiSpam = require('./templates/antispam')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })
const antispam = new AntiSpam()
const slashCommands = []

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
    command.aliasses.forEach(e => {
      client.commands.set(e, command)
    })
    const options = command.options.filter(c => c.slash !== undefined && c.slash === true).map(c => {
      return { name: c.name, description: c.description || c.slashDescription, required: c.required, type: c.type }
    })

    slashCommands.push({
      name: command.name,
      description: command?.slashDescription || command.description,
      options: options
    })
  })

  /**
   * Setup / commands
   */
  const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

  (async () => {
    try {
      console.log('🚧 Started refreshing application (/) commands.')

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: slashCommands },
      )

      console.log('🎉 Successfully reloaded application (/) commands.')
    } catch (error) { console.error(error) }
  })()

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
  else if (antispam.isIgnored(message.author.id, message.createdAt, message.channel)) return
  else {
    const msg = message.content.slice(prefix.length).trim()
    const args = msg.split(/ +/)
    const command = args.shift().toLowerCase()

    if (!client.commands.has(command)) message.channel.send(errorCard('Command not found')).catch((err) => console.log(err))
    else try {
      const msg = await client.commands.get(command).execute(message, args)
      if (msg.length !== undefined) msg.forEach(m => message.channel.send(m).catch((err) => console.log(err)))
      else message.channel.send(msg).catch((err) => console.log(err))
    } catch (error) {
      console.log(error)
      message.channel.send(errorCard('An error has occured')).catch((err) => console.log(err))
    }
  }
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isSelectMenu()) {
    interaction.deferUpdate().then(async () => {
      await client.selectMenus.get(interaction.customId)?.execute(interaction)
        .then(resp => interaction.editReply(resp).catch((err) => console.log(err)))
    })
  } if (client.commands.has(interaction.commandName)) {
    if (antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
    else {
      const message = {
        author: interaction.user,
        mentions: {
          users: new Discord.Collection()
        },
        content: ''
      }
      const args = []
      interaction.options['_hoistedOptions'].filter(o => o.type === 'STRING').forEach(o => {
        o.value.trim().split(' ').forEach(e => { if (e !== '') args.push(e) })
        message.content += o.value
      })

      interaction.options['_hoistedOptions'].filter(o => o.type === 'USER')
        .forEach(o => message.mentions.users.set(o.user.id, o.user))

      interaction.deferReply().then(async () => {
        await client.commands.get(interaction.commandName)?.execute(message, args)
          .then(resp => {
            if (Array.isArray(resp)) {
              resp.forEach(r => {
                interaction.followUp(r).catch((err) => console.log(err))
              })
            } else interaction.editReply(resp).catch((err) => console.log(err))
          }).catch((err) => console.log(err))
      })
    }
  }
})

// Send datas to top.gg
if (process.env.TOPGG_TOKEN) AutoPoster(process.env.TOPGG_TOKEN, client).on('posted', () => { guildCount(client) })

// Start the bot
client.login(process.env.TOKEN)
