const { color, name } = require('../config.json')
const Discord = require('discord.js')
const RegexFun = require('../functions/regex')
const Steam = require('../functions/steam')
const Player = require('../functions/player')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerStats = await Player.getStats(playerId)

    const faceitLevel = playerDatas.games.csgo.skill_level_label

    const card = new Discord.MessageEmbed()
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setDescription(`
        Level: **${faceitLevel}**, 
        Elo: **${playerDatas.games.csgo.faceit_elo}**, 
        Games: **${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)**,
        K/D: **${playerStats.lifetime['Average K/D Ratio']}**
      `)
      .setColor(color.levels[faceitLevel - 1])

    message.channel.send(card)

  } catch (error) {
    console.log(error)
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(color.error)
        .setDescription('**No players found**')
        .setFooter(`${name} Error`)
    )
  }
}

module.exports = {
  name: 'stats',
  aliasses: ['stats'],
  options: ' [user steam id/ steam custom url id/ steam profile link/ csgo `status` ingame command with the users part]',
  description: 'Show the stats of the user(s) given',
  type: 'stats',
  async execute(message, args) {
    const steamParam = args[0].split('/').filter(e => e).pop()
    const steamIds = RegexFun.findSteamId(message)

    if (steamIds.length > 0)
      steamIds.forEach(e => {
        sendCardWithInfos(message, e)
      })
    else
      sendCardWithInfos(message, steamParam)
  }
}