const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const Options = require('../templates/options')
const { getCardsConditions } = require('../functions/commands')
const { getPagination } = require('../functions/pagination')

const getLevelFromElo = (elo) => {
  const colorLevel = Object.entries(color.levels).filter(e => {
    return elo >= e.at(1).min && elo <= e.at(1).max
  }).at(0)
  return colorLevel?.at(0)
}

const sendCardWithInfos = async (interaction, playerId, matchId = null, page = 0) => {
  const maxMatch = 10
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64)
  const playerHistory = await Match.getMatchElo(playerId, maxMatch, page)

  const faceitElo = playerDatas.games.csgo.faceit_elo
  const maxPage = Math.floor(playerStats.lifetime.Matches / maxMatch)
  const size = 40
  const filesAtt = []
  const cards = []

  if (!playerHistory.length > 0)
    return errorCard(`Couldn\'t get the last match of ${steamDatas?.personaname}`).embeds.at(0)

  if (!matchId) matchId = playerHistory[0].matchId

  const filteredHistory = playerHistory.map(e => e.matchId).filter((e, i, a) => a.indexOf(e) === i)
  const matchStats = playerHistory.filter(e => e.matchId === matchId)
  const lastMatchsElo = Graph.getElo(maxMatch + 1, [...playerHistory], faceitElo, page === 0)

  const levelDiff = playerHistory.map(e => e.matchId === matchId)
    .map((e, i) => e ? lastMatchsElo.at(i) : null)
    .filter(e => e !== null)
  const eloDiff = playerHistory.map(e => e.matchId === matchId)
    .map((e, i) => e ? lastMatchsElo.at(i) - lastMatchsElo.at(i + 1) : null)
    .filter(e => e !== null)

  let mapThumbnail
  if (cards.length === 0)
    matchStats.forEach(async (roundStats, i) => {
      const card = new Discord.MessageEmbed()
      const mapName = roundStats.i1
      const result = Math.max(...roundStats.i18.split('/').map(Number)) === parseInt(roundStats.c5)
      const eloGain = isNaN(eloDiff.at(i)) ? '0' : eloDiff.at(i) > 0 ? `+${eloDiff.at(i)}` : eloDiff.at(i).toString()

      const level = getLevelFromElo(levelDiff.at(i))
      if (level !== undefined) {
        const rankImageCanvas = await Graph.getRankImage(
          level,
          levelDiff.at(i),
          size)
        filesAtt.push(new Discord.MessageAttachment(rankImageCanvas, `${faceitElo}${i}.png`))
      }
      if (roundStats === undefined)
        cards.push(errorCard(`Couldn\'t get the stats of ${steamDatas?.personaname} from his last match`).embeds.at(0))
      if (matchStats.length > 1)
        card.addFields({ name: 'round', value: `${i + 1}/${matchStats.length}` })

      mapThumbnail = `./images/maps/${mapName}.jpg`


      card.setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar, url: `https://www.faceit.com/fr/players/${playerDatas.nickname}` })
        .setDescription(`[Steam](${steamDatas?.profileurl}), [Game Lobby](https://www.faceit.com/fr/csgo/room/${matchId}/scoreboard)`)
        .addFields({ name: 'Score', value: roundStats.i18, inline: true },
          { name: 'Map', value: mapName, inline: true },
          { name: 'Status', value: result ? emojis.won.balise : emojis.lost.balise, inline: true },
          { name: 'K/D', value: roundStats.c2, inline: true },
          { name: 'HS', value: `${roundStats.c4}%`, inline: true },
          { name: 'MVPs', value: roundStats.i9, inline: true },
          { name: 'Kills', value: roundStats.i6, inline: true },
          { name: 'Deaths', value: roundStats.i8, inline: true },
          { name: 'Assists', value: roundStats.i7, inline: true },
          { name: 'Elo', value: eloGain, inline: true },
          { name: 'Date', value: new Date(roundStats.date).toDateString(), inline: true })
        .setThumbnail(`attachment://${faceitElo}${i}.png`)
        .setImage(`attachment://${mapName}.jpg`)
        .setColor(result ? color.won : color.lost)
        .setFooter({ text: `Steam: ${steamDatas?.personaname}` })

      if (fs.existsSync(mapThumbnail))
        filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${mapName}.jpg`))

      cards.push(card)
    })

  const options = filteredHistory.map(e => {
    const matchRounds = playerHistory.filter(matchs => matchs.matchId === e)
    const match = matchRounds.at(0)
    const result = matchRounds
      .map(e => Math.max(...e.i18.split('/').map(Number)) === parseInt(e.c5))
      .filter(e => e === true).length >= Math.ceil(matchRounds.length / 2)

    const maps = matchRounds.map(r => r.i1)

    return {
      label: new Date(match.date).toDateString(),
      description: maps.join(' '),
      emoji: result !== undefined ? result ? emojis.won.balise : emojis.lost.balise : null,
      default: e === matchId,
      value: `${interaction.user.id}${playerId}${e}`
    }
  })

  return {
    embeds: cards,
    files: filesAtt,
    components: [
      new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageSelectMenu()
            .setCustomId('lastSelector')
            .setPlaceholder('Select another match')
            .addOptions(options),
        ),
      getPagination(page, maxPage, 'pageLast')
    ]
  }
}

module.exports = {
  name: 'last',
  options: Options.stats,
  description: 'Get the stats of last game.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  },
}

module.exports.sendCardWithInfos = sendCardWithInfos