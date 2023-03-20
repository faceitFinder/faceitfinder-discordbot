const { name, join, color } = require('../config.json')
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
          .setDescription(`Hey <@${interaction.user.id}> you can join my server by clicking on the following link\n${join}`)
          .setFooter({ text: `${name} Join` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}