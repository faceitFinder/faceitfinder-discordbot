const { color, name } = require('../config.json')
const Discord = require('discord.js')
const { getTranslation } = require('../languages/setup')

module.exports = (description, lang) => {
  console.log(description)
  if (!description.includes(' ') && description.includes('.')) description = getTranslation(description, lang)

  return {
    embeds: [new Discord.EmbedBuilder()
      .setColor(color.error)
      .setDescription(description)
      .setFooter({ text: `${name} ${getTranslation('strings.error', lang)}` })]
  }
}