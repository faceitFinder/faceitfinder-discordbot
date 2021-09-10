const { prefix } = require('../config.json')
const Discord = require('discord.js')
const User = require('../database/user')
const RegexFun = require('../functions/regex')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const ErrorCard = require('../templates/errorCard')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerStats = await Player.getStats(playerId)
    const playerDatas = await Player.getDatas(playerId)

    const options = []

    playerStats.segments.forEach(e => options.push({
      label: `${e.label} ${e.mode}`,
      value: JSON.stringify({
        map: e.label,
        mode: e.mode,
        steamId: steamId,
        userId: message.author.id
      })
    }))

    const row = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('mapSelector')
          .setPlaceholder('No maps selected')
          .addOptions(options),
      )

    message.channel.send({
      content: `Select one of the following maps to get the stats related (${playerDatas.nickname})`,
      components: [row]
    })

  } catch (error) {
    console.log(error)
    message.channel.send({ embeds: [ErrorCard('**No players found**')] })
  }
}

module.exports = {
  name: 'map',
  aliasses: ['map'],
  options: '{user steam id | steam custom id | steam profile link | csgo status ingame command with the users part | @ someone}',
  description: "Displays your stats of the map given, or the stats of the user tagged. (only 1 user by command)",
  type: 'command',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)

    if (message.mentions.users.size > 0) {
      const user = await User.exists(message.mentions.users.first().id)
      if (!user) message.channel.send({ embeds: [ErrorCard('**No players found**')] })
      else sendCardWithInfos(message, user.steamId)
    }
    else if (steamIds.length > 0) sendCardWithInfos(message, steamIds[0])
    else if (args.length > 0) sendCardWithInfos(message, args[0].split('/').filter(e => e).pop())
    else if (await User.get(message.author.id)) sendCardWithInfos(message, (await User.get(message.author.id)).steamId)
    else message.channel.send({ embeds: [ErrorCard(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`)] })
  }
}