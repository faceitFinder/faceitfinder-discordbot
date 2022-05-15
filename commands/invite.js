const { name, invite, color } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'invite',
  options: [],
  description: 'Get the link to invite the bot on your server.',
  usage: '',
  type: 'system',
  async execute(interaction) {
    return {
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription(`Hey <@${interaction.user.id}> you can invite me by clicking on the following link\n${invite}`)
          .setFooter({ text: `${name} Invite` })
      ],
      files: [
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ]
    }
  }
}