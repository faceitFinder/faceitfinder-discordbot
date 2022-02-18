const { color, name } = require('../config.json')
const Discord = require('discord.js')

module.exports = (description) => {
  return {
    embeds: [new Discord.MessageEmbed()
      .setColor(color.error)
      .setDescription(description)
      .setFooter({ text: `${name} Error` })]
  }
}