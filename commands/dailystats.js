const { color } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const generatePlayerStats = async (playerHistory, playerId) => {
  const playerStats = { wins: [0], games: [0], 'Average K/D Ratio': [0.0], 'Average Headshots': [0] }

  for (const e of playerHistory.items)
    await Match.getMatchStats(e.match_id).then(ms =>
      ms.rounds.forEach(r => r.teams.forEach(t => {
        const ps = t.players.filter(p => p.player_id === playerId)

        if (ps.length > 0) {
          playerStats.games[0] += 1
          playerStats['Average Headshots'][0] += parseFloat(ps.at(0).player_stats['Headshots %'])
          playerStats['Average K/D Ratio'][0] += parseFloat(ps.at(0).player_stats['K/D Ratio'])
          if (ps.at(0).player_stats.Result == 1) playerStats.wins[0] += 1
        }
      })))

  return playerStats
}

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)

    const today = new Date().setHours(0, 0, 0, 0)
    const playerHistory = await Player.getHistory(playerId, 100, parseInt(today.toString().slice(0, -3)))
    const playerStats = await generatePlayerStats(playerHistory, playerId)

    if (playerStats.games.at(0) === 0) return errorCard('Couldn\'t get today matches')
    const graphCanvas = await Graph.generateCanvas(playerId, playerStats.games.at(0) + 1)
    const elo = await Graph.getElo(playerId, playerStats.games.at(0) + 1)
    const startElo = elo.shift()

    const faceitLevel = playerDatas.games.csgo.skill_level_label
    const size = 40

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

    const card = new Discord.MessageEmbed()
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setTitle('Steam')
      .setURL(steamDatas.profileurl)
      .setThumbnail(`attachment://${faceitLevel}level.png`)
      .addFields({ name: 'From', value: new Date(today).toDateString(), inline: false },
        { name: 'Games', value: `${elo.length} (${Math.ceil((playerStats.wins / playerStats.games) * 100)}% Win)`, inline: true },
        { name: 'Elo', value: (startElo - elo.at(-1)).toString(), inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Average K/D', value: (playerStats['Average K/D Ratio'] / playerStats.games).toFixed(2).toString(), inline: true },
        { name: 'Average Headshots %', value: `${(playerStats['Average Headshots %'] / playerStats.games).toFixed(2)}%`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true })
      .setImage(`attachment://${steamId}graph.png`)
      .setColor(color.levels[faceitLevel].color)
      .setFooter(`Steam: ${steamDatas.personaname}`)

    return {
      embeds: [card],
      files: [
        new Discord.MessageAttachment(graphCanvas.toBuffer(), `${steamId}graph.png`),
        new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}level.png`)
      ]
    }
  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'dailystats',
  aliasses: ['dailystats', 'ds'],
  options: [
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6
    }
  ],
  description: "Displays the stats of the current of the user(s) given, including a graph that show the elo evolution.",
  slashDescription: "Displays your stats of the current day, including a graph that show your elo evolution.",
  usage: '',
  type: 'stats',
  async execute(message, args) {
    return await getCardsConditions(message.mentions.users, [], [], message, sendCardWithInfos)
  }
}