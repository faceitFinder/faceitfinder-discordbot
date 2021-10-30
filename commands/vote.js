const { name, vote, color } = require('../config.json')
const Discord = require('discord.js')

module.exports = {
  name: 'vote',
  aliasses: ['vote'],
  options: [],
  description: "Get the link to vote for the bot on top.gg",
  usage: '',
  type: 'system',
  async execute(message, args) {
    return await {
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setAuthor(name, 'attachment://logo.png')
          .setDescription(`Hey <@${message.author.id}> you can vote for me on the following link\n${vote}`)
          .setFooter(`${name} Vote`)
      ],
      files: [
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ]
    }
  }
}