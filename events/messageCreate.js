const errorCard = require('../templates/errorCard')
const { prefix } = require('../config.json')

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return
    else if (message.client.antispam.isIgnored(message.author.id, message.createdAt, message.channel)) return
    else {
      const msg = message.content.slice(prefix.length).trim()
      const args = msg.split(/ +/)
      const command = args.shift().toLowerCase()

      if (!message.client.commands.has(command))
        message.channel.send(errorCard('Command not found')).catch((err) => console.log(err))
      else try {
        const msg = await message.client.commands.get(command).execute(message, args)
        if (msg.length !== undefined) msg.forEach(m => message.channel.send(m).catch((err) => console.log(err)))
        else message.channel.send(msg).catch((err) => console.log(err))
      } catch (error) {
        console.log(error)
        message.channel.send(errorCard('An error has occured')).catch((err) => console.log(err))
      }
    }
  }
}