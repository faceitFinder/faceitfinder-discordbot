const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const Options = require('../templates/options')
const { getCardsConditions, getInteractionOption } = require('../functions/commands')
const { getPagination, getPageSlice, getMaxPage } = require('../functions/pagination')
const { getPlayerHistory, generatePlayerStats } = require('../functions/dateStats')
const { findPlayersStats } = require('../functions/find')
const { TYPES } = require('../templates/customType')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')

const getLevelFromElo = (elo) => {
  const colorLevel = Object.entries(color.levels).filter(e => {
    return elo >= e.at(1).min && elo <= e.at(1).max
  }).at(0)
  return colorLevel?.at(0)
}

const getMatchItems = (interaction, playerDatas, steamDatas, playerHistory, maxMatch, page, matchId) => {
  const size = 40
  const filesAtt = []
  const cards = []
  const faceitElo = playerDatas.games.csgo.faceit_elo

  const matchStats = playerHistory.filter(e => e.matchId === matchId)
  const lastMatchesElo = Graph.getElo(maxMatch + 1, structuredClone(playerHistory), faceitElo, page === 0)
  const eloDiff = Graph.getEloGain(maxMatch, structuredClone(matchStats), faceitElo, page === 0)
  const levelDiff = playerHistory.map(e => e.matchId === matchId)
    .map((e, i) => e ? lastMatchesElo.at(i) : null)
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
        cards.push(errorCard(getTranslation('error.user.lastMatchNoStats', interaction.locale, {
          playerName: playerDatas.nickname,
        }), interaction.locale).embeds.at(0))
      if (matchStats.length > 1)
        card.addFields({ name: 'round', value: `${i + 1}/${matchStats.length}` })

      mapThumbnail = `./images/maps/${mapName}.jpg`

      card.setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
        .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Game Lobby](https://www.faceit.com/en/csgo/room/${matchId}/scoreboard)`)
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

const sendCardWithInfo = async (interaction, playerId, matchId = null, page = 0, players = [], mapName = null, excludedPlayers = []) => {
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64).catch(err => err.statusText)
  const playerFullHistory = await getPlayerHistory(playerId, playerStats.lifetime.Matches, true)
  let playerHistory
  const funFactCard = []
  const files = []
  const pagination = getPageSlice(page)
  const map = getInteractionOption(interaction, 'map')

  if (map) mapName = map

  playerHistory = playerFullHistory

  if (players.length > 0 || excludedPlayers.length > 0) {
    playerHistory = await findPlayersStats(playerId, players, excludedPlayers, playerStats.lifetime.Matches, playerDatas)
    if (!players.includes(playerId)) players.push(playerId)
  }

  if (mapName) playerHistory = playerHistory.filter(e => e.i1 === mapName)

  if (!playerHistory.length > 0) {
    if (players.length > 0) return errorCard(getTranslation('error.user.noMatchFoundWithOthers', interaction.locale, {
      playerName: playerDatas.nickname,
    }), interaction.locale)

    return errorCard(getTranslation('error.user.lastMatchNoStats', interaction.locale, {
      playerName: playerDatas.nickname,
    }), interaction.locale)
  }

  // Removing multiple ids
  const filteredHistory = playerHistory.map(e => e.matchId).filter((e, i, a) => a.indexOf(e) === i)
  const maxPage = getMaxPage(filteredHistory)

  if (!matchId) matchId = filteredHistory.slice(pagination.start, pagination.end).at(0)

  const matchItems = getMatchItems(interaction, playerDatas, steamDatas, playerFullHistory, playerFullHistory.length, page, matchId)
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

  if (players.length > 0 || excludedPlayers.length > 0) {
    const faceitLevel = playerDatas.games.csgo.skill_level
    const faceitElo = playerDatas.games.csgo.faceit_elo
    const size = 40

    const from = playerHistory.at(-1).date
    const to = playerHistory.at(0).date
    const playerStats = generatePlayerStats(playerHistory)

    const elo = Graph.getEloGain(playerHistory.length, playerHistory, faceitElo, false)
    const eloDiff = elo.filter(e => e).reduce((a, b) => a + b, 0)

    const graphBuffer = Graph.generateChart(playerHistory,
      faceitElo,
      playerStats.games,
      TYPES.ELO_KD,
      false)

    const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)

    files.push(new Discord.AttachmentBuilder(graphBuffer, { name: `${playerId}graph.png` }),
      new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` }))

    const selectedPlayerStats = new Discord.EmbedBuilder()
      .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
      .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
      .setThumbnail(`attachment://${faceitLevel}level.png`)
      .addFields({
        name: 'From - To',
        value: [new Date(from).toDateString(), '\n', new Date(to).toDateString()].join(' '),
        inline: false
      },
      { name: 'Highest Elo', value: playerStats['Highest Elo'], inline: true },
      { name: 'Lowest Elo', value: playerStats['Lowest Elo'], inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { name: 'Games', value: `${playerStats.games} (${playerStats.winrate}% Win)`, inline: true },
      { name: 'Elo', value: isNaN(eloDiff) ? '0' : eloDiff > 0 ? `+${eloDiff}` : eloDiff.toString(), inline: true },
      { name: 'Average MVPs', value: playerStats['Average MVPs'], inline: true },
      { name: 'K/D', value: playerStats.kd.toString(), inline: true },
      { name: 'Kills', value: playerStats.kills.toString(), inline: true },
      { name: 'Deaths', value: playerStats.deaths.toString(), inline: true },
      { name: 'Average K/D', value: playerStats['Average K/D'], inline: true },
      { name: 'Average K/R', value: playerStats['Average K/R'], inline: true },
      { name: 'Average HS', value: `${playerStats['Average HS']}%`, inline: true },
      { name: 'Average Kills', value: playerStats['Average Kills'], inline: true },
      { name: 'Average Deaths', value: playerStats['Average Deaths'], inline: true },
      { name: 'Average Assists', value: playerStats['Average Assists'], inline: true },
      { name: 'Red K/D', value: playerStats['Red K/D'].toString(), inline: true },
      { name: 'Orange K/D', value: playerStats['Orange K/D'].toString(), inline: true },
      { name: 'Green K/D', value: playerStats['Green K/D'].toString(), inline: true })
      .setImage(`attachment://${playerId}graph.png`)
      .setColor(color.levels[faceitLevel].color)
      .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })

    funFactCard.push(selectedPlayerStats)
  }

  matchItems.embeds.unshift(...funFactCard)
  matchItems.files.push(...files)

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('lastSelectorInfo')
          .setPlaceholder(getTranslation('strings.selectMatchBellow', interaction.locale))
          .setDisabled(true)
          .setOptions([{
            label: getTranslation('strings.lastMatchLabel', interaction.locale),
            description: getTranslation('strings.lastMatchDescription', interaction.locale),
            value: JSON.stringify({
              u: interaction.user.id,
              s: playerId,
              m: mapName,
            })
          }])),
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('lastSelector')
          .setPlaceholder(getTranslation('strings.selectAnotherMatch', interaction.locale))
          .addOptions(options.slice(pagination.start, pagination.end))),
    getPagination(page, maxPage, 'pageLast')
  ]

  if (players.length > 0)
    components.push(
      new Discord.ActionRowBuilder()
        .addComponents(await Promise.all(players.map(async (p) => {
          const playerDatas = await Player.getDatas(p)

          return new Discord.ButtonBuilder()
            .setCustomId(JSON.stringify({
              id: 'fUSG',
              s: p
            }))
            .setLabel(playerDatas.nickname)
            .setStyle(Discord.ButtonStyle.Success)
            .setDisabled(playerId === p)
        }))))

  if (excludedPlayers.length > 0)
    components.push(
      new Discord.ActionRowBuilder()
        .addComponents(await Promise.all(excludedPlayers.map(async (p) => {
          const playerDatas = await Player.getDatas(p)
          return new Discord.ButtonBuilder()
            .setCustomId(p)
            .setLabel(playerDatas.nickname)
            .setStyle(Discord.ButtonStyle.Danger)
            .setDisabled(true)
        }))))

  return {
    ...matchItems,
    components: components,
  }
}

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.unshift(getMapOption())

  return options
}

module.exports = {
  name: 'last',
  options: getOptions(),
  description: getTranslation('command.last.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.last.description'),
  usage: `${Options.usage} <map>`,
  example: 'steam_parameters: justdams',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  },
}

module.exports.sendCardWithInfo = sendCardWithInfo
module.exports.getMatchItems = getMatchItems