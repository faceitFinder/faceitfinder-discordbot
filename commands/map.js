const { color, name, prefix } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')

const sendCardWithInfos = async (message, steamId) => {

}

module.exports = {
  name: 'map',
  aliasses: ['map'],
  options: '<map name> {@ someone}',
  description: "Displays your stats of the map given, or the stats of the user tagged.",
  type: 'command',
  async execute(message, args) {
    if (message.mentions.users.size > 0) {
      const user = await User.exists(message.mentions.users[0])
      if (!user) message.channel.send(new Discord.MessageEmbed().setColor(color.error).setDescription('**No players found**').setFooter(`${name} Error`))
      else sendCardWithInfos(message, user.steamId)
    }
    else if (await User.get(message.author.id)) sendCardWithInfos(message, (await User.get(message.author.id)).steamId)
    else
      message.channel.send(new Discord.MessageEmbed()
        .setColor(color.error)
        .setDescription(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`)
        .setFooter(`${name} Error`))
  }
}