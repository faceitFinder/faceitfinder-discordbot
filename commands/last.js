const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const successCard = require('../templates/successCard')
const Options = require('../templates/options')
const { getCardsConditions } = require('../functions/commands')
const { getPagination, getPageSlice, getMaxPage } = require('../functions/pagination')
const { getPlayerHistory } = require('../functions/dateStats')

const getLevelFromElo = (elo) => {
  const colorLevel = Object.entries(color.levels).filter(e => {
    return elo >= e.at(1).min && elo <= e.at(1).max
  }).at(0)
  return colorLevel?.at(0)
}

const getMatchItems = (playerDatas, steamDatas, playerHistory, maxMatch, page, matchId) => {
  const size = 40
  const filesAtt = []
  const cards = []
  const faceitElo = playerDatas.games.csgo.faceit_elo

  const matchStats = playerHistory.filter(e => e.matchId === matchId)
  const lastMatchesElo = Graph.getElo(maxMatch + 1, [...playerHistory], faceitElo, page === 0)

  const levelDiff = playerHistory.map(e => e.matchId === matchId)
    .map((e, i) => e ? lastMatchesElo.at(i) : null)
    .filter(e => e !== null)
  const eloDiff = playerHistory.map(e => e.matchId === matchId)
    .map((e, i) => e ? lastMatchesElo.at(i) - lastMatchesElo.at(i + 1) : null)
    .filter(e => e !== null)

  let mapThumbnail
  if (cards.length === 0)
    matchStats.forEach(async (roundStats, i) => {
      const card = new Discord.EmbedBuilder()
      const mapName = roundStats.i1
      const result = Math.max(...roundStats.i18.split('/').map(Number)) === parseInt(roundStats.c5)
      const eloGain = isNaN(eloDiff.at(i)) ? '0' : eloDiff.at(i) > 0 ? `+${eloDiff.at(i)}` : eloDiff.at(i).toString()

      const level = getLevelFromElo(levelDiff.at(i))
      if (level !== undefined) {
        const rankImageCanvas = await Graph.getRankImage(
          level,
          levelDiff.at(i),
          size)
        filesAtt.push(new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitElo}${i}.png` }))
      }
      if (roundStats === undefined)
        cards.push(errorCard(`Couldn\'t get the stats of ${steamDatas?.personaname || steamDatas} from his last match`).embeds.at(0))
      if (matchStats.length > 1)
        card.addFields({ name: 'round', value: `${i + 1}/${matchStats.length}` })

      mapThumbnail = `./images/maps/${mapName}.jpg`

      card.setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/fr/players/${playerDatas.nickname}` })
        .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Game Lobby](https://www.faceit.com/fr/csgo/room/${matchId}/scoreboard)`)
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
        .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })

      if (fs.existsSync(mapThumbnail))
        filesAtt.push(new Discord.AttachmentBuilder(mapThumbnail, { name: `${mapName}.jpg` }))

      cards.push(card)
    })

  return {
    embeds: cards,
    files: filesAtt
  }
}

const sendCardWithInfo = async (interaction, playerId, matchId = null, page = 0, players = []) => {
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64).catch(err => err.statusText)
  const playerFullHistory = await getPlayerHistory(playerId, playerStats.lifetime.Matches, true)
  let playerHistory
  const funFactCard = []
  const pagination = getPageSlice(page)

  if (players.length > 0) {
    const playerHistoryMatches = (await getPlayerHistory(playerId, playerStats.lifetime.Matches, false))
      .filter(m => players.every(p => m.playing_players.includes(p)))
    const matchIds = playerHistoryMatches.map(e => e.match_id)

    playerHistory = (await getPlayerHistory(playerId, playerStats.lifetime.Matches))
      .filter(m => matchIds.includes(m.matchId))

    funFactCard.push(successCard(`**${playerDatas.nickname}** played ${playerHistoryMatches.length} game(s) with the player(s) selected.\nThis corresponds to ${((playerHistoryMatches.length * 100) / playerStats.lifetime.Matches).toFixed(2)}% of **${playerDatas.nickname}**'s matches played.`).embeds[0])
  } else playerHistory = playerFullHistory

  if (!playerHistory.length > 0)
    return errorCard(`Couldn\'t get the last matches of ${steamDatas?.personaname || steamDatas} ${players.length > 0 ? 'with the requested users.' : ''}`)

  // Removing multiple ids
  const filteredHistory = playerHistory.map(e => e.matchId).filter((e, i, a) => a.indexOf(e) === i)
  const maxPage = getMaxPage(filteredHistory)

  if (!matchId) matchId = filteredHistory.slice(pagination.start, pagination.end).at(0)

  const matchItems = getMatchItems(playerDatas, steamDatas, playerFullHistory, playerFullHistory.length, page, matchId)
  const options = filteredHistory.map(e => {
    const matchRounds = playerHistory.filter(matches => matches.matchId === e)
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
      value: e.toString()
    }
  })

  matchItems.embeds.push(...funFactCard)

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId('lastSelectorInfo')
          .setPlaceholder('Select one of the match bellow.')
          .setDisabled(true)
          .setOptions([{
            label: 'Last match stats info.',
            description: 'Info about the last match.',
            value: JSON.stringify({
              u: interaction.user.id,
              s: playerId
            })
          }])),
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId('lastSelector')
          .setPlaceholder('Select another match')
          .addOptions(options.slice(pagination.start, pagination.end))),
    getPagination(page, maxPage, 'pageLast')
  ]

  if (players.length > 0)
    components.push(
      new Discord.ActionRowBuilder()
        .addComponents(await Promise.all(players.map(async (p) => {
          const playerDatas = await Player.getDatas(p)

          return new Discord.ButtonBuilder()
            .setCustomId(JSON.stringify({ s: p }))
            .setLabel(playerDatas.nickname)
            .setStyle(Discord.ButtonStyle.Success)
            .setDisabled(true)
        }))))

  return {
    ...matchItems,
    components: components
  }
}

module.exports = {
  name: 'last',
  options: Options.stats,
  description: 'Get the stats of last game.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  },
}

module.exports.sendCardWithInfo = sendCardWithInfo
module.exports.getMatchItems = getMatchItems