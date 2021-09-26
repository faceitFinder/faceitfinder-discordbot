const { color } = require('../../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const Graph = require('../../functions/graph')
const Match = require('../../functions/match')
const errorCard = require('../../templates/errorCard')

const generatePlayerStats = async (playerHistory, playerId) => {
  const playerStats = { wins: [0], games: [0], 'Average K/D Ratio': [0.0], 'Average HS': [0] }

  for (const e of playerHistory.items)
    await Match.getMatchStats(e.match_id).then(ms =>
      ms.rounds.forEach(r => r.teams.forEach(t => {
        const ps = t.players.filter(p => p.player_id === playerId)

        if (ps.length > 0) {
          playerStats.games[0] += 1
          playerStats['Average HS'][0] += parseFloat(ps.at(0).player_stats['Headshots %'])
          playerStats['Average K/D Ratio'][0] += parseFloat(ps.at(0).player_stats['K/D Ratio'])
          if (ps.at(0).player_stats.Result == 1) playerStats.wins[0] += 1
        }
      })))

  return playerStats
}

module.exports = {
  name: 'dailyStatsSelector',
  async execute(interaction) {
    const values = JSON.parse(interaction.values)
    if (values.userId === interaction.user.id)
      try {
        const steamDatas = await Steam.getDatas(values.steamId)
        const playerId = await Player.getId(values.steamId)
        const playerDatas = await Player.getDatas(playerId)

        const faceitLevel = playerDatas.games.csgo.skill_level_label
        const size = 40

        const to = parseInt((new Date(values.date * 1000).setHours(24)).toString().slice(0, -3))

        const playerHistory = await Player.getHistory(playerId, values.maxMatch, values.date, to)
        const playerStats = await generatePlayerStats(playerHistory, playerId)

        const canvaSize = playerStats.games.at(0) + 1

        const elo = await Graph.getElo(playerId, values.maxMatch, to * 1000, canvaSize)
        const graphCanvas = await Graph.generateCanvas(playerId, values.maxMatch, to * 1000, canvaSize)
        const startElo = elo.shift()

        const rankImageCanvas = Canvas.createCanvas(size, size)
        const ctx = rankImageCanvas.getContext('2d')
        ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

        const card = new Discord.MessageEmbed()
          .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
          .setTitle('Steam')
          .setURL(steamDatas.profileurl)
          .setThumbnail(`attachment://${faceitLevel}level.png`)
          .addFields({ name: 'From', value: new Date(values.date * 1000).toDateString(), inline: false },
            { name: 'Games', value: `${playerStats.games.at(0)} (${((playerStats.wins / playerStats.games) * 100).toFixed(2)}% Win)`, inline: true },
            { name: 'Elo', value: (startElo - elo.at(-1)).toString(), inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Average K/D', value: (playerStats['Average K/D Ratio'] / playerStats.games).toFixed(2).toString(), inline: true },
            { name: 'Average HS', value: `${(playerStats['Average HS'] / playerStats.games).toFixed(2)}%`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true })
          .setImage(`attachment://${values.steamId}graph.png`)
          .setColor(color.levels[faceitLevel].color)
          .setFooter(`Steam: ${steamDatas.personaname}`)

        return {
          embeds: [card],
          files: [
            new Discord.MessageAttachment(graphCanvas.toBuffer(), `${values.steamId}graph.png`),
            new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}level.png`)
          ]
        }
      } catch (error) {
        console.log(error)
        interaction.editReply(errorCard(error.toString()))
      }
    else return false
  }
}