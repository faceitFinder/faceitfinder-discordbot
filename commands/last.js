const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const fs = require('fs')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const RegexFun = require('../functions/regex')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (message = null, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerHistory = await Player.getHistory(playerId)

    let lastMatchStats
    if (playerHistory.items.length > 0) lastMatchStats = await Match.getMatchStats(playerHistory.items[0].match_id)
    else return errorCard(`Couldn\'t get the last match of ${steamDatas.personaname}`)

    const lastMatchElo = await Match.getMatchElo(playerId, 2)

    const faceitLevel = playerDatas.games.csgo.skill_level
    const size = 40
    const filesAtt = []

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

    let eloDiff = playerDatas.games.csgo.faceit_elo - lastMatchElo[1]?.elo || 0
    eloDiff = isNaN(eloDiff) ? '0' : eloDiff > 0 ? `+${eloDiff}` : eloDiff.toString()
    const cards = []

    let mapThumbnail
    lastMatchStats.rounds.forEach(r => {
      const card = new Discord.MessageEmbed()
      let playerStats
      for (const t of r.teams) {
        const stats = t.players.filter(p => p.player_id === playerId)
        if (stats.length > 0) playerStats = stats[0].player_stats
      }

      if (playerStats === undefined) cards.push(errorCard(`Couldn\'t get the stats of ${steamDatas.personaname} from his last match`).embeds[0])
      if (lastMatchStats.rounds.length > 1) card.addFields({ name: 'round', value: `${r.match_round}/${lastMatchStats.rounds.length}` })
      mapThumbnail = `./images/maps/${r.round_stats.Map}.jpg`

      if (playerStats !== undefined && playerDatas !== undefined) {
        filesAtt.push(new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}.png`))

        card.setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
          .setDescription(`[Steam](${steamDatas.profileurl}), [Game Lobby](https://www.faceit.com/fr/csgo/room/${playerHistory.items[0].match_id}/scoreboard)`)
          .addFields({ name: 'Score', value: r.round_stats.Score.toString(), inline: true },
            { name: 'Map', value: r.round_stats.Map, inline: true },
            { name: 'Status', value: parseInt(playerStats.Result) ? emojis.won.balise : emojis.lost.balise, inline: true },
            { name: 'K/D', value: playerStats['K/D Ratio'], inline: true },
            { name: 'HS', value: `${playerStats['Headshots %']}%`, inline: true },
            { name: 'MVPs', value: playerStats.MVPs, inline: true },
            { name: 'Kills', value: playerStats.Kills, inline: true },
            { name: 'Deaths', value: playerStats.Deaths, inline: true },
            { name: 'Assists', value: playerStats.Assists, inline: true },
            { name: 'Elo', value: eloDiff.toString(), inline: true },
            { name: 'Date', value: new Date(lastMatchElo[0].date).toDateString(), inline: true })
          .setThumbnail(`attachment://${faceitLevel}.png`)
          .setImage(`attachment://${r.round_stats.Map}.jpg`)
          .setColor(parseInt(playerStats.Result) ? color.won : color.lost)
          .setFooter(`Steam: ${steamDatas.personaname}`)

        if (fs.existsSync(mapThumbnail))
          filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${r.round_stats.Map}.jpg`))

        cards.push(card)
      }
    })

    return {
      embeds: cards,
      files: filesAtt
    }

  } catch (error) {
    console.log(error)
    return errorCard(error)
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
      type: 6,
      slash: true
    }
  ],
  description: "Get the stats of last game played by you or the given user(s).",
  slashDescription: "Get the stats of the last game played by you or the @ user.",
  usage: 'one of the options',
  type: 'stats',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)
    const params = []
    await args.forEach(async e => { params.push(e.split('/').filter(e => e).pop()) })

    return await getCardsConditions(message.mentions.users, steamIds, params, message, sendCardWithInfos)
  }
}