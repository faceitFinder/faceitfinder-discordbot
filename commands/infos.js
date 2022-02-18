const { name, invite, color, creator, vote, github, join } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')

module.exports = {
  name: 'infos',
  aliasses: ['infos', 'info', 'inf'],
  options: [],
  description: 'Get the infos about the bot.',
  usage: '',
  type: 'system',
  async execute(message, args) {
    return {
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
          .setDescription('**Bot infos**')
          .addFields({ name: 'Creator', value: `<@${creator}>` },
            { name: 'Github', value: github },
            { name: 'Invitation link', value: invite },
            { name: 'Vote link', value: vote },
            { name: 'Server link', value: join },
            { name: 'Account linked', value: (await User.count()).toString() })
          .setFooter({ text: `${name} Infos` })
      ],
      files: [
        new Discord.MessageAttachment('./images/logo.png', 'logo.png')
      ]
    }
  }
}