const { name, color } = require('../config.json')
const Discord =  require('discord.js')
const { getTranslation, getTranslations } = require('../languages/setup')

module.exports = {
  name: 'verify',
  options: [],
  description: getTranslation('command.verify.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.verify.description'),
  usage: '',
  example: '',
  type: 'utility',
  async execute(interaction) {
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription(getTranslation('strings.verifyDescription', interaction.locale, { discord: `<@${interaction.user.id}>` }))
          .setImage('attachment://verify.png')
          .setFooter({ text: `${name} ${getTranslation('strings.verify', interaction.locale)}` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' }),
        new Discord.AttachmentBuilder('./images/verify.png', { name: 'verify.png' })
      ]
    }
  }
}