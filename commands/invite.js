const { name, invite, color } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'invite',
  aliasses: ['invite', 'inv'],
  options: [],
  description: "Get the link to invite the bot on your server.",
  usage: '',
  type: 'system',
  async execute(message, args) {
    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setAuthor(`${name}`, 'attachment://logo.png')
          .setDescription(`Hey <@${message.author.id}> you can invite me by clicking on the following link\n${invite}`)
          .setFooter(`${name} Invite`)
      ],
      files: [
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ]
    })
  }
}