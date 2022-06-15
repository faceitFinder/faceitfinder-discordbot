const Discord = require('discord.js')

const generateButtons = (values, type, disabled) => {
  return new Discord.MessageButton()
    .setCustomId(JSON.stringify(values))
    .setLabel(type.name)
    .setEmoji(type.emoji)
    .setStyle('SECONDARY')
    .setDisabled(disabled)
}

module.exports = {
  generateButtons
}