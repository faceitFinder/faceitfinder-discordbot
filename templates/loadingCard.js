const Discord = require('discord.js')
const { color, name } = require('../config.json')

module.exports = (interation) => {
  interation.editReply({
    content: ' ',
    embeds: [
      new Discord.MessageEmbed()
        .setColor(color.primary)
        .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
        .setDescription('Your request is currently processing..')
        .setFooter({ text: 'FaceitFinder Loader' })
    ],
    attachments: [],
    components: [],
  })
}