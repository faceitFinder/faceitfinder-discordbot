const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const Match = require('./match')
const Steam = require('./steam')
const Player = require('./player')
const Graph = require('./graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const { getPagination } = require('./pagination')

const generatePlayerStats = playerHistory => {
  const playerStats = {
    wins: 0,
    games: 0,
    'Average K/D': 0,
    'Average K/R': 0,
    'Average HS': 0,
    'Average MVPs': 0,
    'Average Kills': 0,
    'Average Deaths': 0,
    'Average Assists': 0,
    'Red K/D': 0,
    'Orange K/D': 0,
    'Green K/D': 0,
  }

  for (const e of playerHistory) {
    playerStats.games += 1
    const KD = parseFloat(e.c2)
    playerStats['Average K/D'] += KD
    playerStats['Average K/R'] += parseFloat(e.c3)
    playerStats['Average HS'] += parseFloat(e.c4)
    playerStats['Average MVPs'] += parseFloat(e.i9)
    playerStats['Average Kills'] += parseFloat(e.i6)
    playerStats['Average Deaths'] += parseFloat(e.i8)
    playerStats['Average Assists'] += parseFloat(e.i7)

    if (KD >= color.kd[1].min && KD <= color.kd[1].max) playerStats['Red K/D'] += 1
    else if (KD >= color.kd[2].min && KD <= color.kd[2].max) playerStats['Orange K/D'] += 1
    else if (KD >= color.kd[3].min && KD <= color.kd[3].max) playerStats['Green K/D'] += 1

    playerStats.wins += Math.max(...e.i18.split('/').map(Number)) === parseInt(e.c5)
  }

  playerStats.winrate = getAverage(playerStats.wins, playerStats.games, 2, 100)
  playerStats['Average K/D'] = getAverage(playerStats['Average K/D'], playerStats.games)
  playerStats['Average K/R'] = getAverage(playerStats['Average K/R'], playerStats.games)
  playerStats['Average HS'] = getAverage(playerStats['Average HS'], playerStats.games)
  playerStats['Average MVPs'] = getAverage(playerStats['Average MVPs'], playerStats.games)
  playerStats['Average Kills'] = getAverage(playerStats['Average Kills'], playerStats.games)
  playerStats['Average Deaths'] = getAverage(playerStats['Average Deaths'], playerStats.games)
  playerStats['Average Assists'] = getAverage(playerStats['Average Assists'], playerStats.games)

  return playerStats
}

const getAverage = (q, d, fixe = 2, percent = 1) => ((parseFloat(q) / parseFloat(d)) * percent).toFixed(fixe)

const getPlayerHistory = async (playerId, maxMatch) => {
  const playerHistory = []
  const playerStats = await Player.getStats(playerId)
  if (maxMatch > playerStats.lifetime.Matches) maxMatch = playerStats.lifetime.Matches
  for (let page = 0; page < Math.ceil(maxMatch / 2000); page++)
    playerHistory.push(...await Match.getMatchElo(playerId, maxMatch, page))
  return playerHistory
}

const getDates = async (playerId, maxMatch, getDay) => {
  const dates = new Map()
  const playerHistory = await getPlayerHistory(playerId, maxMatch)

  playerHistory.forEach(e => {
    const day = getDay(e.date)
    if (!dates.has(day)) dates.set(day, { number: 1, date: day })
    else dates.set(day, { number: dates.get(day).number + 1, date: day })
  })

  return dates
}

const setOptionDefault = option => {
  option.setEmoji(emojis.select.balise)
    .setDefault(true)

  return option
}

const getCardWithInfos = async (actionRow, values, type, id, maxMatch, maxPage = null, page = null, map = null) => {
  const playerId = values.s
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64).catch(err => err.statusText)
  const pStats = await Player.getStats(playerId)

  if (maxMatch === null) maxMatch = pStats.lifetime.Matches

  const faceitLevel = playerDatas.games.csgo.skill_level
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const size = 40

  let playerHistory = await getPlayerHistory(playerId, map ? pStats.lifetime.Matches : maxMatch)
  if (map) playerHistory = playerHistory.filter(e => e.i1 === map).slice(0, maxMatch)

  let from = values.f * 1000 || playerHistory.at(-1).date
  const to = values.t * 1000 || new Date().setHours(+24)

  const playerStats = generatePlayerStats(playerHistory.filter(e => e.date >= from && e.date < to))

  const today = new Date().setHours(24, 0, 0, 0)

  const checkElo = today >= from && today <= to
  const playerHistoryTo = playerHistory.filter(e => e.date < to)
  const elo = await Graph.getElo(playerStats.games + 1, playerHistoryTo, faceitElo, checkElo)
  const eloDiff = elo.at(0) - elo.at(-1)

  const graphBuffer = Graph.generateChart(playerHistoryTo,
    faceitElo,
    playerStats.games + (type === CustomType.TYPES.ELO),
    type,
    checkElo)

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)
  const toRealTimeStamp = new Date(to).setHours(-24)

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/fr/players/${playerDatas.nickname}` })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/fr/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(
      from !== toRealTimeStamp ?
        {
          name: 'From - To', value: [new Date(from).toDateString(), '\n', new Date(toRealTimeStamp).toDateString()].join(' '),
          inline: true
        } :
        { name: 'From', value: new Date(from).toDateString(), inline: false },
      { name: 'Map', value: map || 'All', inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { name: 'Games', value: `${playerStats.games} (${playerStats.winrate}% Win)`, inline: true },
      { name: 'Elo', value: isNaN(eloDiff) ? '0' : eloDiff > 0 ? `+${eloDiff}` : eloDiff.toString(), inline: true },
      { name: 'Average MVPs', value: playerStats['Average MVPs'], inline: true },
      { name: 'Average K/D', value: playerStats['Average K/D'], inline: true },
      { name: 'Average K/R', value: playerStats['Average K/R'], inline: true },
      { name: 'Average HS', value: `${playerStats['Average HS']}%`, inline: true },
      { name: 'Average Kills', value: playerStats['Average Kills'], inline: true },
      { name: 'Average Deaths', value: playerStats['Average Deaths'], inline: true },
      { name: 'Average Assists', value: playerStats['Average Assists'], inline: true },
      { name: 'Red K/D', value: playerStats['Red K/D'].toString(), inline: true },
      { name: 'Orange K/D', value: playerStats['Orange K/D'].toString(), inline: true },
      { name: 'Green K/D', value: playerStats['Green K/D'].toString(), inline: true })
    .setImage(`attachment://${values.s}graph.png`)
    .setColor(color.levels[faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })

  const components = [
    actionRow,
    new Discord.ActionRowBuilder()
      .addComponents([
        CustomTypeFunc.generateButtons(
          { id: id, n: 1 },
          CustomType.TYPES.KD,
          type === CustomType.TYPES.KD),
        CustomTypeFunc.generateButtons(
          { id: id, n: 2 },
          CustomType.TYPES.ELO,
          type === CustomType.TYPES.ELO),
        CustomTypeFunc.generateButtons(
          { id: id, n: 3 },
          CustomType.TYPES.ELO_KD,
          type === CustomType.TYPES.ELO_KD)
      ])]

  if (page !== null) components.push(getPagination(page, maxPage, 'pageDS'))

  return {
    embeds: [card],
    content: null,
    files: [
      new Discord.AttachmentBuilder(graphBuffer, { name: `${values.s}graph.png` }),
      new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` })
    ],
    components: components
  }
}

module.exports = {
  getDates,
  getCardWithInfos,
  setOptionDefault,
  getPlayerHistory,
  generatePlayerStats,
}