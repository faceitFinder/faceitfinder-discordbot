const Discord = require('discord.js')
const { color, name } = require('../config.json')

module.exports = (interaction) => {
  if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel')) return
  interaction.editReply({
    content: ' ',
    embeds: [
      new Discord.EmbedBuilder()
        .setColor(color.primary)
        .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
        .setDescription('Your request is currently processing..')
        .setFooter({ text: 'FaceitFinder Loader' })
    ],
    attachments: [],
    components: [],
  }).catch(console.error)
}