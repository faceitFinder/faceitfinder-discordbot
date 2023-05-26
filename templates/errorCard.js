const { color, name } = require('../config.json')
const Discord = require('discord.js')
const { getTranslation } = require('../languages/setup')

module.exports = (description, lang) => {
  if (typeof description === 'string' && !description.includes(' ') && description.includes('.')) description = getTranslation(description, lang)

  return {
    embeds: [new Discord.EmbedBuilder()
      .setColor(color.error)
      .setDescription(description)
      .setFooter({ text: `${name} ${getTranslation('strings.error', lang)}` })]
  }
}