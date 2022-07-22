const Discord = require('discord.js')

const generateButtons = (values, type, disabled) => {
  return new Discord.ButtonBuilder()
    .setCustomId(JSON.stringify(values))
    .setLabel(type.name)
    .setEmoji(type.emoji)
    .setStyle(type.style)
    .setDisabled(disabled)
}

module.exports = {
  generateButtons
}