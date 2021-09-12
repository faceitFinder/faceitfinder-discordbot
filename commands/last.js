const { color, emojis, prefix } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const fs = require('fs')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const RegexFun = require('../functions/regex')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const { getCards } = require('../functions/commands')

const sendCardWithInfos = async (message = null, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerHistory = await Player.getHistory(playerId)


    let lastMatchStats
    if (playerHistory.items.length > 0) lastMatchStats = await Match.getMatchStats(playerHistory.items[0].match_id)
    else return errorCard('**Could not get your last match stats**')

    const lastMatchElo = await Match.getMatchElo(playerId, 2)

    const faceitLevel = playerDatas.games.csgo.skill_level_label
    const size = 40
    const filesAtt = []

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)
    filesAtt.push(new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}.png`))

    const eloDiff = playerDatas.games.csgo.faceit_elo - lastMatchElo[1].elo

    let card = new Discord.MessageEmbed()
    let mapThumbnail
    lastMatchStats.rounds.forEach((r, key) => {
      let playerStats
      for (const t of r.teams) {
        const stats = t.players.filter(p => p.player_id === playerId)
        if (stats.length > 0) playerStats = stats[0].player_stats
      }

      if (lastMatchStats.rounds.length > 1) card.addField({ name: 'round', value: key })
      mapThumbnail = `./images/maps/${r.round_stats.Map}.jpg`

      card.setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
        .setDescription(`[Steam](${steamDatas.profileurl}), [Game Lobby](https://www.faceit.com/fr/csgo/room/${playerHistory.items[0].match_id}/scoreboard)`)
        .addFields({ name: 'Score', value: `${r.round_stats.Score}`, inline: true },
          { name: 'Map', value: `${r.round_stats.Map}`, inline: true },
          { name: 'Status', value: `${parseInt(playerStats.Result) ? emojis.won.balise : emojis.lost.balise}`, inline: true },
          { name: 'K/D', value: `${playerStats['K/D Ratio']}`, inline: true },
          { name: 'HS', value: `${playerStats['Headshots %']}%`, inline: true },
          { name: 'MVPs', value: `${playerStats.MVPs}`, inline: true },
          { name: 'Kills', value: `${playerStats.Kills}`, inline: true },
          { name: 'Deaths', value: `${playerStats.Deaths}`, inline: true },
          { name: 'Assists', value: `${playerStats.Assists}`, inline: true },
          { name: 'Elo', value: `${eloDiff > 0 ? '+' + eloDiff : eloDiff}`, inline: true },
          { name: 'Date', value: new Date(lastMatchElo[0].date).toDateString(), inline: true })
        .setThumbnail(`attachment://${faceitLevel}.png`)
        .setImage(`attachment://${r.round_stats.Map}.jpg`)
        .setColor(color.levels[faceitLevel].color)
        .setFooter(`Steam: ${steamDatas.personaname}`)

      if (fs.existsSync(mapThumbnail)) filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${r.round_stats.Map}.jpg`))
    })

    return {
      embeds: [card],
      files: filesAtt
    }

  } catch (error) {
    console.log(error)
    return errorCard('**No players found**')
  }
}

module.exports = {
  name: 'last',
  aliasses: ['last', 'l', 'lst'],
  options: [
    {
      name: 'user_steam_id',
      description: 'Steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'user_custom_steam_id',
      description: 'Custom steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'steam_profile_link',
      description: 'Url of a steam profile.',
      required: false,
      type: 3
    },
    {
      name: 'csgo_status',
      description: 'The result of the "status" command in CS:GO that contains the user part.',
      required: false,
      type: 3
    },
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6
    }
  ],
  description: "Get the stats of last game played by the given user (s).",
  usage: 'one of the options',
  type: 'command',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)

    if (message.mentions.users.size > 0) return await getCards(message, message.mentions.users, sendCardWithInfos, 1)
    else if (steamIds.length > 0) return getCards(message, steamIds, sendCardWithInfos)
    else if (args.length > 0) {
      const params = []
      await args.forEach(async e => { params.push(e.split('/').filter(e => e).pop()) })
      return getCards(message, params, sendCardWithInfos)
    }
    else if (await User.get(message.author.id)) return await getCards(message, [message.author], sendCardWithInfos, 1)
    else return errorCard(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`)
  }
}