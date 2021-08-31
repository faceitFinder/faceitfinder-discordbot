const { color, name, prefix } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const RegexFun = require('../functions/regex')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const Ladder = require('../functions/ladder')
const User = require('../database/user')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerStats = await Player.getStats(playerId)
    const graphCanvas = await Graph.generateCanvas(playerId)

    const playerCountry = playerDatas.country
    const playerRegion = playerDatas.games.csgo.region

    const ladderCountry = await Ladder.getDatas(playerId, playerRegion, playerCountry)
    const ladderRegion = await Ladder.getDatas(playerId, playerRegion)

    const faceitLevel = playerDatas.games.csgo.skill_level_label
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
      .setTitle('Steam')
      .setURL(steamDatas.profileurl)
      .setThumbnail('attachment://level.png')
      .addFields(
        { name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
        { name: 'K/D', value: playerStats.lifetime['Average K/D Ratio'], inline: true },
        { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true })
      .addFields(
        { name: 'Elo', value: playerDatas.games.csgo.faceit_elo, inline: true },
        { name: `:flag_${playerCountry}:`, value: ladderCountry.position, inline: true },
        { name: `:flag_${playerRegion.toLowerCase()}:`, value: ladderRegion.position, inline: true })
      .setImage('attachment://graph.png')
      .setColor(color.levels[faceitLevel - 1])
      .setFooter(`Steam: ${steamDatas.personaname}`)

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
  aliasses: ['stats', 's'],
  options: '{user steam id | steam custom id | steam profile link | csgo status ingame command with the users part | @ someone}',
  description: "Parameters are optional if you linked your account.\nDisplays the statistics of the given user (s), with a graph showing the evolution of his elo over his last 20 games (or less if he has not played 20)",
  type: 'command',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)

    if (message.mentions.users.size > 0)
      message.mentions.users.forEach(async (e) => {
        const user = await User.exists(e.id)
        if (!user) message.channel.send(new Discord.MessageEmbed().setColor(color.error).setDescription('**No players found**').setFooter(`${name} Error`))
        else sendCardWithInfos(message, user.steamId)
      })
    else if (steamIds.length > 0)
      steamIds.forEach(e => {
        sendCardWithInfos(message, e)
      })
    else if (args.length > 0)
      args.forEach(e => {
        const steamParam = e.split('/').filter(e => e).pop()
        sendCardWithInfos(message, steamParam)
      })
    else if (await User.get(message.author.id)) sendCardWithInfos(message, (await User.get(message.author.id)).steamId)
    else
      message.channel.send(new Discord.MessageEmbed()
        .setColor(color.error)
        .setDescription(`You need to link your account to do that, do ${prefix}help link to see how.`)
        .setFooter(`${name} Error`))
  }
}