const { name, join, color } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'join',
  aliasses: ['join'],
  options: [],
  description: "Get the link to join the community server of the bot .",
  usage: '',
  type: 'system',
  async execute(message, args) {
    return {
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setAuthor(`${name}`, 'attachment://logo.png')
          .setDescription(`Hey <@${message.author.id}> you can join my server by clicking on the following link\n${join}`)
          .setFooter(`${name} Join`)
      ],
      files: [
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ]
    }
  }
}