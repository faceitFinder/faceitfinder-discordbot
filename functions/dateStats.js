const { color, emojis, maxMatchsDateStats } = require('../config.json')
const Discord = require('discord.js')
const Match = require('./match')
const Steam = require('./steam')
const Player = require('./player')
const Graph = require('./graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')

const generatePlayerStats = playerHistory => {
  const playerStats = {
    wins: 0,
    games: 0,
    'Average K/D': 0,
    'Average HS': 0,
    'Average MVPs': 0,
    'Average Kills': 0,
    'Average Deaths': 0,
    'Average Assists': 0,
  }

  for (const e of playerHistory) {
    playerStats.games += 1
    playerStats['Average HS'] += parseFloat(e.c4)
    playerStats['Average K/D'] += parseFloat(e.c2)
    playerStats['Average MVPs'] += parseFloat(e.i9)
    playerStats['Average Kills'] += parseFloat(e.i6)
    playerStats['Average Deaths'] += parseFloat(e.i8)
    playerStats['Average Assists'] += parseFloat(e.i7)
    playerStats.wins += Math.max(...e.i18.split('/').map(Number)) === parseInt(e.c5)
  } return playerStats
}

const getAverage = (q, d, fixe = 2, percent = 1) => { return ((q / d) * percent).toFixed(fixe) }

const getDates = async (playerId, maxMatch, getDay) => {
  const dates = new Map()
  await Match.getMatchElo(playerId, maxMatch)
    .then(m => m.forEach(e => {
      const day = getDay(e.date)
      if (!dates.has(day)) dates.set(day, { number: 1, date: day })
      else dates.set(day, { number: dates.get(day).number + 1, date: day })
    }))

  return dates
}

const setOption = option => {
  return { ...option, emoji: emojis.select.balise, default: true }
}

const getCardWithInfos = async (actionRow, values, type) => {
  const playerId = values.s
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64)

  const faceitLevel = playerDatas.games.csgo.skill_level
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const size = 40
  const from = values.f * 1000
  const to = values.t * 1000

  const playerHistory = await Match.getMatchElo(playerId, maxMatchsDateStats)
  const playerStats = generatePlayerStats(playerHistory.filter(e => e.date >= from && e.date < to))

  const canvaSize = playerStats.games + 1
  const today = new Date().setHours(24, 0, 0, 0)
  const checkElo = today >= from && today <= to

  const elo = Graph.getElo(canvaSize, playerHistory.filter(e => e.date < to), faceitElo, checkElo)
  let graphDatas = elo

  if (type === CustomType.TYPES.KD)
    graphDatas = CustomTypeFunc.getGraph(type, playerHistory.filter(e => e.date < to), faceitElo, checkElo, playerStats.games)

  const eloDiff = elo.at(0) - elo.at(-1)
  const graphCanvas = Graph.generateCanvas(graphDatas, null, null, canvaSize, type)


  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)
  const toRealTimeStamp = new Date(to).setHours(-24)

  const card = new Discord.MessageEmbed()
    .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar, url: `https://www.faceit.com/fr/players/${playerDatas.nickname}` })
    .setTitle('Steam')
    .setURL(steamDatas.profileurl)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(
      from !== toRealTimeStamp ?
        {
          name: 'From - To', value: [new Date(from).toDateString(), '-', new Date(toRealTimeStamp).toDateString()].join(' '),
          inline: false
        } :
        { name: 'From', value: new Date(from).toDateString(), inline: false },
      { name: 'Games', value: `${playerStats.games} (${getAverage(playerStats.wins, playerStats.games, 2, 100)}% Win)`, inline: true },
      { name: 'Elo', value: isNaN(eloDiff) ? '0' : eloDiff > 0 ? `+${eloDiff}` : eloDiff.toString(), inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: 'Average K/D', value: getAverage(playerStats['Average K/D'], playerStats.games), inline: true },
      { name: 'Average HS', value: `${getAverage(playerStats['Average HS'], playerStats.games)}%`, inline: true },
      { name: 'Average MVPs', value: getAverage(playerStats['Average MVPs'], playerStats.games), inline: true },
      { name: 'Average Kills', value: getAverage(playerStats['Average Kills'], playerStats.games), inline: true },
      { name: 'Average Deaths', value: getAverage(playerStats['Average Deaths'], playerStats.games), inline: true },
      { name: 'Average Assists', value: getAverage(playerStats['Average Assists'], playerStats.games), inline: true })
    .setImage(`attachment://${values.s}graph.png`)
    .setColor(color.levels[faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas.personaname}` })

  return {
    embeds: [card],
    content: null,
    files: [
      new Discord.MessageAttachment(graphCanvas.toBuffer(), `${values.s}graph.png`),
      new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}level.png`)
    ],
    components: [
      actionRow,
      new Discord.MessageActionRow()
        .addComponents([
          CustomTypeFunc.generateButtons(
            { id: 'uDSG', n: 1 },
            CustomType.TYPES.KD,
            type === CustomType.TYPES.KD),
          CustomTypeFunc.generateButtons(
            { id: 'uDSG', n: 2 },
            CustomType.TYPES.ELO,
            type === CustomType.TYPES.ELO)
        ])]
  }
}


module.exports = {
  getDates,
  getCardWithInfos,
  setOption,
}