const { name, invite, color, creator, vote, github, join } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')
const { getTranslations, getTranslation } = require('../languages/setup')

module.exports = {
  name: 'info',
  options: [],
  description: getTranslation('command.info.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.info.description'),
  usage: '',
  type: 'system',
  async execute(interaction) {
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription('**Bot info**')
          .addFields({ name: 'Creator', value: `<@${creator}>` },
            { name: 'Github', value: github },
            { name: 'Invitation link', value: invite },
            { name: 'Vote link', value: vote },
            { name: 'Server link', value: join },
            { name: 'Account linked', value: (await User.count()).toString() })
          .setFooter({ text: `${name} Info` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}