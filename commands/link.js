const { color, prefix } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const RegexFun = require('../functions/regex')
const User = require('../database/user')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const discordId = message.author.id

    await User.exists(discordId) ? await User.update(discordId, steamId) : User.create(discordId, steamId)

    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setDescription(`Your account has been linked to ${playerDatas.nickname}`)
      ]
    })

  } catch (error) {
    console.log(error)
    message.channel.send({ embeds: [ErrorCard('**No players found**')] })
  }
}

module.exports = {
  name: 'link',
  aliasses: ['link'],
  options: '<user steam id | steam custom id | steam profile link | csgo status ingame command with your user line>',
  description: `Link steam id to the discord user, so when you do ${prefix}stats or ${prefix}last it displays directly your stats.`,
  type: 'command',
  async execute(message, args) {
    const steamId = RegexFun.findSteamUIds(message.content)

    if (steamId.length > 0) sendCardWithInfos(message, steamId)
    else if (args.length > 0) sendCardWithInfos(message, args[0].split('/').filter(e => e).pop())
    else message.channel.send({ embeds: [ErrorCard(`A parameter is missing, please do ${prefix}help link, to see how to do.`)] })
  }
}