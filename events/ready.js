const Discord = require('discord.js')
const mongo = require('../database/mongo')
const fs = require('fs')
const { guildCount } = require('../functions/client')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

module.exports = {
  name: 'ready',
  execute(client) {
    console.log('🚀 Bot started!')
    mongo().then(() => { console.log('🧱 Connected to mongo') }).catch((e) => {
      console.error(e)
    })

    /**
     * Setup commands
     */
    client.commands = new Discord.Collection()
    client.slashCommands = []
    fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(async (file) => {
      const command = require(`../commands/${file}`)

      command.aliasses.forEach(e => { client.commands.set(e, command) })

      client.slashCommands.push({
        name: command.name,
        description: command?.slashDescription || command.description,
        options: command.options.filter(c => c.slash !== undefined && c.slash === true).map(c => {
          return { name: c.name, description: c.description || c.slashDescription, required: c.required, type: c.type }
        })
      })
    })

    /**
     * Setup / commands
     */
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    (async () => {
      try {
        console.log('🚧 Started refreshing application (/) commands.')
        await rest.put(Routes.applicationCommands(client.user.id), { body: client.slashCommands })
        console.log('🎉 Successfully reloaded application (/) commands.')
      } catch (error) { console.error(error) }
    })()

    /**
     * Setup interactions
     */
    fs.readdirSync('./interactions').forEach(folder => {
      client[folder] = new Discord.Collection()

      fs.readdirSync(`./interactions/${folder}`).filter(file => file.endsWith('.js')).forEach(interactionFileName => {
        const i = require(`../interactions/${folder}/${interactionFileName}`)
        client[folder].set(i.name, i)
      })
    })

    guildCount(client)
  }
}