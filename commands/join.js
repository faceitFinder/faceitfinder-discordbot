const { name, join, color } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'join',
  aliasses: ['join'],
  options: '',
  description: "Get the link to join the community server of the bot .",
  type: 'system',
  async execute(message, args) {
    message.channel.send(new Discord.MessageEmbed()
      .attachFiles([
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ])
      .setColor(color.primary)
      .setAuthor(`${name}`, 'attachment://logo.png')
      .setDescription(`Hey <@${message.author.id}> you can join my server by clicking on the following link\n${join}`)
      .setFooter(`${name} Invite`))
  }
}