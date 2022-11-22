const { color, name } = require('../config.json')
const Discord = require('discord.js')

module.exports = (description) => {
  return {
    embeds: [
      new Discord.EmbedBuilder()
        .setColor(color.primary)
        .setDescription(description)
        .setFooter({ text: `${name} Info` })
    ]
  }
}