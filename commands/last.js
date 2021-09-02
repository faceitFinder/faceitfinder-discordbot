const { name, color } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const fs = require('fs')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const RegexFun = require('../functions/regex')
const User = require('../database/user')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerHistory = await Player.getHistory(playerId)

    let lastMatchStats
    if (playerHistory.items.length > 0) lastMatchStats = await Match.getMatchStats(playerHistory.items[0].match_id)
    else {
      message.channel.send(new Discord.MessageEmbed()
        .setColor(color.error)
        .setDescription('**Could not get your last match stats**')
        .setFooter(`${name} Error`))
      return
    }

    const lastMatchElo = await Match.getMatchElo(playerId, 2)

    const faceitLevel = playerDatas.games.csgo.skill_level_label
    const size = 40

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

    const eloDiff = playerDatas.games.csgo.faceit_elo - lastMatchElo[1].elo

    let card = new Discord.MessageEmbed()
    lastMatchStats.rounds.forEach((r, key) => {
      let playerStats
      for (const t of r.teams) {
        const stats = t.players.filter(p => p.player_id === playerId)
        if (stats.length > 0) playerStats = stats[0].player_stats
      }

      if (lastMatchStats.rounds.length > 1) card.addField({ name: 'round', value: key })

      let mapThumbnail = `./images/maps/${r.round_stats.Map}.jpg`
      if (!fs.existsSync(mapThumbnail)) mapThumbnail = `./images/maps/unknown.png`

      card
        .attachFiles([
          new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png'),
          new Discord.MessageAttachment(mapThumbnail, 'map.jpg'),
        ])
        .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
        .setTitle('Steam')
        .setURL(steamDatas.profileurl)
        .addFields({ name: 'Score', value: r.round_stats.Score, inline: true },
          { name: 'Map', value: r.round_stats.Map, inline: true },
          { name: 'Status', value: parseInt(playerStats.Result) ? 'Won' : 'Lost', inline: true },
          { name: 'K/D', value: playerStats['K/D Ratio'], inline: true },
          { name: 'HS', value: `${playerStats['Headshots %']}%`, inline: true },
          { name: 'MVPs', value: playerStats.MVPs, inline: true },
          { name: 'Kills', value: playerStats.Kills, inline: true },
          { name: 'Deaths', value: playerStats.Deaths, inline: true },
          { name: 'Assists', value: playerStats.Assists, inline: true },
          { name: 'Elo', value: eloDiff > 0 ? `+${eloDiff}` : eloDiff })
        .setThumbnail('attachment://level.png')
        .setImage('attachment://map.jpg')
        .setColor(color.levels[faceitLevel - 1])
        .setFooter(`Steam: ${steamDatas.personaname}`)
    })

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
  name: 'last',
  aliasses: ['last'],
  options: '',
  description: "Get the stats of last game played by the given user (s).",
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
        .setDescription(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`)
        .setFooter(`${name} Error`))
  }
}