const { color, name } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const RegexFun = require('../functions/regex')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const Ladder = require('../functions/ladder')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerStats = await Player.getStats(playerId)
    const graphCanvas = await Graph.generateCanvas(playerId)
    const ladderCountry = await Ladder.getDatas(playerId, playerDatas.country)
    const ladderRegion = await Ladder.getDatas(playerId)

    const faceitLevel = playerDatas.games.csgo.skill_level_label
    const playerRegion = playerDatas.games.csgo.region
    const size = 40

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

    const card = new Discord.MessageEmbed()
      .attachFiles([
        new Discord.MessageAttachment(graphCanvas.toBuffer(), 'graph.png'),
        new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png')
      ])
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setThumbnail('attachment://level.png')
      .addFields(
        { name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
        { name: 'K/D', value: `${playerStats.lifetime['Average K/D Ratio']}`, inline: true },
        { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true })
      .addFields(
        { name: 'Elo', value: `${playerDatas.games.csgo.faceit_elo}`, inline: true },
        { name: `:flag_${playerDatas.country}:`, value: `${ladderCountry.position}`, inline: true },
        { name: `:flag_${playerRegion.toLowerCase()}:`, value: `${ladderRegion.position}`, inline: true })
      .setImage('attachment://graph.png')
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
  aliasses: ['stats', 's', 'dodolegroscochon'],
  options: ' [user steam id/ steam custom url id/ steam profile link/ csgo status ingame command with the users part]',
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