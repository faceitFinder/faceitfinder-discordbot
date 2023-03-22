const { ButtonBuilder } = require('discord.js')
const { getTranslation } = require('../languages/setup')

const generateButtons = (interaction, values, type, disabled) => {
  let name = type.name
  if (type.translate) name = getTranslation(name, interaction.locale)

  return new ButtonBuilder()
    .setCustomId(JSON.stringify(values))
    .setLabel(name)
    .setEmoji(type.emoji)
    .setStyle(type.style)
    .setDisabled(disabled)
}

module.exports = {
  generateButtons
}