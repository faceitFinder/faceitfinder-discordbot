const { name, color } = require('../config.json')
const Discord = require('discord.js')
const { getTranslations, getTranslation } = require('../languages/setup')

module.exports = {
  name: 'invite',
  options: [],
  description: getTranslation('command.invite.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.invite.description'),
  usage: '',
  type: 'system',
  async execute(interaction) {
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription(getTranslation('strings.inviteDescription', interaction.locale, { discord: `<@${interaction.user.id}>` }))
          .setFooter({ text: `${name} ${getTranslation('strings.invite', interaction.locale)}` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}