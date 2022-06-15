const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')


const getPlayerStats = (teams, playerId) => {
  for (const team of teams) {
    const stats = team.players.filter(p => p.player_id === playerId).filter(e => e !== undefined)
    if (stats.length > 0) return stats[0].player_stats
  }
}

const sendCardWithInfos = async (interaction, playerId, matchId = null) => {
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64)
  const playerHistory = (await Player.getHistory(playerId, 5))
  const cards = []

  let lastMatchStats
  matchId = matchId || playerHistory.items[0].match_id
  if (playerHistory.items.length > 0)
    lastMatchStats = await Match.getMatchStats(matchId).catch(err => cards.push(errorCard(err)))
  else return errorCard(`Couldn\'t get the last match of ${steamDatas?.personaname}`)

  const faceitElo = playerDatas.games.csgo.faceit_elo
  const faceitLevel = playerDatas.games.csgo.skill_level
  const size = 40
  const filesAtt = []

  const lastMatchs = await Match.getMatchElo(playerId, 6)
  const lastMatch = lastMatchs.map((e, k) => {
    if (e.matchId === matchId) return { lastMatchStats: e, lastMatchIndex: k }
  }).filter(e => e !== undefined).at(0)

  const lastMatchsElo = Graph.getElo(6, lastMatchs, faceitElo)
  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)

  let eloDiff = lastMatchsElo.at(lastMatch?.lastMatchIndex) - lastMatchsElo.at(lastMatch?.lastMatchIndex + 1) || 0
  eloDiff = isNaN(eloDiff) ? '0' : eloDiff > 0 ? `+${eloDiff}` : eloDiff.toString()

  let mapThumbnail
  if (cards.length === 0)
    lastMatchStats.rounds.forEach(r => {
      const card = new Discord.MessageEmbed()
      let playerStats = getPlayerStats(r.teams, playerId)

      if (playerStats === undefined) cards.push(errorCard(`Couldn\'t get the stats of ${steamDatas?.personaname} from his last match`).embeds[0])
      if (lastMatchStats.rounds.length > 1) card.addFields({ name: 'round', value: `${r.match_round}/${lastMatchStats.rounds.length}` })
      mapThumbnail = `./images/maps/${r.round_stats.Map}.jpg`

      if (playerStats !== undefined && playerDatas !== undefined) {
        filesAtt.push(new Discord.MessageAttachment(rankImageCanvas, `${faceitLevel}.png`))

        card.setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar, url: `https://www.faceit.com/fr/players/${playerDatas.nickname}` })
          .setDescription(`[Steam](${steamDatas?.profileurl}), [Game Lobby](https://www.faceit.com/fr/csgo/room/${matchId}/scoreboard)`)
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
            { name: 'Date', value: new Date(lastMatch?.lastMatchStats.date).toDateString(), inline: true })
          .setThumbnail(`attachment://${faceitLevel}.png`)
          .setImage(`attachment://${r.round_stats.Map}.jpg`)
          .setColor(parseInt(playerStats.Result) ? color.won : color.lost)
          .setFooter({ text: `Steam: ${steamDatas?.personaname}` })

        if (fs.existsSync(mapThumbnail))
          filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${r.round_stats.Map}.jpg`))

        cards.push(card)
      }
    })

  const options = []
  for (const e of playerHistory.items) {
    await Match.getMatchStats(e.match_id)
      .then(ms => {
        const maps = ms.rounds.map(r => r.round_stats.Map)
        const playerResult = ms.rounds.map(r => getPlayerStats(r.teams, playerId)?.Result).at(0)

        options.push({
          label: new Date(e.finished_at * 1000).toDateString(),
          description: maps.join(' '),
          emoji: playerResult !== undefined ? parseInt(playerResult) ? emojis.won.balise : emojis.lost.balise : null,
          default: e.match_id === matchId,
          value: `${interaction.user.id}${e.match_id}${playerId}`
        })
      })
      .catch(err => console.error(`${err} ${e.match_id}`))
  }

  return {
    embeds: cards,
    files: filesAtt,
    components: [new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('lastSelector')
          .setPlaceholder('Select another match')
          .addOptions(options),
      )]
  }
}

module.exports = {
  name: 'last',
  options: [
    {
      name: 'steam_parameters',
      description: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'team',
      description: 'team slug (you need to be a part of it, the creator, or it has to be public)',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'faceit_parameters',
      description: 'faceit nicknames (case sensitive)',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: 'Get the stats of last game.',
  usage: 'steam_parameters:multiple steam params and @user or CSGO status (max 10 users) OR team:team slug (max 1) OR faceit_parameters:multiple faceit nicknames (max 10)',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  },
}

module.exports.sendCardWithInfos = sendCardWithInfos