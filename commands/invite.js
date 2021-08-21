const { name, invite, color } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'invite',
  aliasses: ['invite', 'inv'],
  options: '',
  description: "Get the link to invite the bot on your server.",
  type: 'system',
  async execute(message, args) {
    message.channel.send(new Discord.MessageEmbed()
      .attachFiles([
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ])
      .setColor(color.primary)
      .setAuthor(`${name}`, 'attachment://logo.png')
      .setDescription(`Hey <@${message.author.id}> you can invite me by clicking on the following link\n${invite}`)
      .setFooter(`${name} Invite`))
  }
}