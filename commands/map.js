const { color, name, prefix } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')
const Player = require('../functions/player')

const sendCardWithInfos = async (message, steamId) => {
  try {
    const playerId = await Player.getId(steamId)
    const playerStats = await Player.getStats(playerId)

    const options = []

    playerStats.segments.forEach(e => options.push({
      label: e.label,
      value: `${e.label},${steamId}`
    }))

    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('mapSelector')
          .setPlaceholder('No maps selected')
          .addOptions(options),
      )

    message.channel.send({
      content: "**Select one of the following maps to get the stats related**",
      components: [row]
    })
  } catch (error) {
    console.log(error)
    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.error)
          .setDescription('**No players found**')
          .setFooter(`${name} Error`)
      ]
    })
  }
}

module.exports = {
  name: 'map',
  aliasses: ['map'],
  options: '{@ someone}',
  description: "Displays your stats of the map given, or the stats of the user tagged.",
  type: 'command',
  async execute(message, args) {
    if (message.mentions.users.size > 0) {
      const user = await User.exists(message.mentions.users[0])
      if (!user) message.channel.send({
        embeds: [
          new Discord.MessageEmbed().setColor(color.error).setDescription('**No players found**').setFooter(`${name} Error`)
        ]
      })
      else sendCardWithInfos(message, user.steamId)
    }
    else if (await User.get(message.author.id)) sendCardWithInfos(message, (await User.get(message.author.id)).steamId)
    else
      message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor(color.error)
            .setDescription(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`)
            .setFooter(`${name} Error`)
        ]
      })
  }
}