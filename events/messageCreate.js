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
        message.reply(errorCard('Command not found')).catch((err) => console.log(err))
      else
        message.client.commands.get(command).execute(message, args)
          .then(resp => {
            if (Array.isArray(resp)) resp.forEach(m => message.reply(m).catch((err) => console.log(err)))
            else message.reply(resp).catch((err) => console.log(err))
          })
          .catch(err => {
            console.log(err)
            message.reply(errorCard('An error has occured')).catch((err) => console.log(err))
          })
    }
  }
}