const { name, vote, color } = require('../config.json')
const Discord = require('discord.js')
const { getTranslation, getTranslations } = require('../languages/setup')
const successCard = require('../templates/successCard')

module.exports = {
  name: 'vote',
  options: [],
  description: getTranslation('command.vote.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.vote.description'),
  usage: '',
  type: 'system',
  async execute(interaction) {
    const description = getTranslation('strings.voteDescription', interaction.locale, {
      discord: `<@${interaction.user.id}>`
    })

    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription(`${description}\n${vote}`)
          .setFooter({ text: `${name} Vote` })
      ],
      files: [
        new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })
      ]
    }
  }
}