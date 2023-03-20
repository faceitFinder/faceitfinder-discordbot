const { name, invite, color } = require('../config.json')
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
          .setDescription(`Hey <@${interaction.user.id}> you can invite me by clicking on the following link\n${invite}`)
          .setFooter({ text: `${name} Invite` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}