const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { getTranslation } = require('../languages/setup')

module.exports = (interaction) => {
  if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel')) return
  interaction.editReply({
    content: ' ',
    embeds: [
      new Discord.EmbedBuilder()
        .setColor(color.primary)
        .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
        .setDescription(getTranslation('strings.messageProcessing', interaction.locale))
        .setFooter({ text: 'FaceitFinder Loader' })
    ],
    attachments: [],
    components: [],
  }).catch(console.error)
}