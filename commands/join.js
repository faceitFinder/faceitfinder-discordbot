const { name, color } = require('../config.json')
const Discord = require('discord.js')
const { getTranslations, getTranslation } = require('../languages/setup')

module.exports = {
  name: 'join',
  options: [],
  description: getTranslation('command.join.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.join.description'),
  usage: '',
  type: 'system',
  async execute(interaction) {
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription(getTranslation('strings.joinDescription', interaction.locale, { discord: `<@${interaction.user.id}>` }))
          .setFooter({ text: `${name} ${getTranslation('strings.join', interaction.locale)}` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}