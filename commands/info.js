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
    const info = getTranslation('strings.info', interaction.locale)
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription(`**Bot ${info}**`)
          .addFields({ name: getTranslation('strings.creator', interaction.locale), value: `<@${creator}>` },
            { name: 'Github', value: github },
            { name: getTranslation('strings.invitationLink', interaction.locale), value: invite },
            { name: getTranslation('strings.voteLink', interaction.locale), value: vote },
            { name: getTranslation('strings.serverLink', interaction.locale), value: join },
            { name: getTranslation('strings.accountLinked', interaction.locale), value: (await User.count()).toString() })
          .setFooter({ text: `${name} ${info}` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}