const { color, name } = require('../config.json')
const Discord = require('discord.js')
const { getTranslation } = require('../languages/setup')

module.exports = (description, lang) => {
  return {
    embeds: [
      new Discord.EmbedBuilder()
        .setColor(color.primary)
        .setDescription(description)
        .setFooter({ text: `${name} ${getTranslation('strings.info', lang)}` })
    ]
  }
}