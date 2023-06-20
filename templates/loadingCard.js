const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { getTranslation } = require('../languages/setup')
const errorHandler = require('../functions/error')

module.exports = (interaction) => {
  if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel')) return
  interaction.editReply({
    content: ' ',
    embeds: [
      new Discord.EmbedBuilder()
        .setColor(color.primary)
        .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
        .setDescription(getTranslation('strings.messageProcessing', interaction.locale))
        .setFooter({ text: `${name} ${getTranslation('strings.loading', interaction.locale)}` })
    ],
    attachments: [],
    components: [],
  }).catch((error) => errorHandler(interaction, error))
}