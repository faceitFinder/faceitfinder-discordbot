const { color, skus } = require('../config.json')
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { getTranslation } = require('../languages/setup')

module.exports = (lang) => {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(color.primary)
        .setDescription(getTranslation('strings.premiumDesc', lang))
    ],
    components: [
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Premium)
            .setSKUId(skus.guild)
        )
    ],
  }
}