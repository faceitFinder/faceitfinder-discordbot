const errorCard = require('../templates/errorCard')
const { prefix } = require('../config.json')
const noMention = require('../templates/noMention')

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return
    else if (message.client.antispam.isIgnored(message.author.id, message.createdAt, message.channel)) return
    else message.reply(noMention(errorCard('error.bot.messageEvent', message.interaction?.locale))).catch(console.error)
  }
}