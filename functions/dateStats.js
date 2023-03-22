const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const Match = require('./match')
const Steam = require('./steam')
const Player = require('./player')
const Graph = require('./graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const { getPagination } = require('./pagination')
const { getInteractionOption } = require('./commands')
const { caching } = require('cache-manager')
const { getTranslation } = require('../languages/setup')

const ttl = 60 * 1000 * 5 // 5 minutes
const cachingMemory = caching('memory', {
  max: 100,
  ttl: ttl,
})

const generatePlayerStats = playerHistory => {
  const playerStats = {
    wins: 0,
    games: 0,
    kills: 0,
    deaths: 0,
    kd: 0,
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
    'Highest elo': 0,
    'Lowest elo': 0,
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
    playerStats.kills += parseFloat(e.i6)
    playerStats.deaths += parseFloat(e.i8)

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
  playerStats.kd = getAverage(playerStats.kills, playerStats.deaths)

  const elo = playerHistory.filter(e => e.elo).map(e => e.elo)

  playerStats['Highest Elo'] = Math.max(...elo).toString()
  playerStats['Lowest Elo'] = Math.min(...elo).toString()

  return playerStats
}

const getAverage = (q, d, fixe = 2, percent = 1) => ((parseFloat(q) / parseFloat(d)) * percent).toFixed(fixe)

const getPlayerHistory = async (playerId, maxMatch, eloMatches = true) => {
  const playerStats = await Player.getStats(playerId)
  const cacheHistory = await cachingMemory
  const limit = 100
  let playerHistory = []
  const cacheName = `${playerId}-${eloMatches ? 'elo' : 'match'}`

  if (maxMatch === null || maxMatch > playerStats.lifetime.Matches) maxMatch = playerStats.lifetime.Matches

  const cache = await cacheHistory.get(cacheName)
  if (cache && cache.length == playerStats.lifetime.Matches) return cache.slice(0, maxMatch)

  if (eloMatches) {
    for (let page = 0; page < Math.ceil(maxMatch / limit); page++) playerHistory.push(...await Match.getMatchElo(playerId, maxMatch, page))

    playerEloGain = playerHistory.filter(e => e?.elo).map((e, i, a) => {
      e.eloGain = e.elo - a[i + 1]?.elo || undefined
      return e
    })

    playerHistory = playerHistory.map(e => {
      const match = playerEloGain.find(m => m.matchId === e.matchId)
      if (match) e.eloGain = match.eloGain
      return e
    })
  } else {
    let max = Math.ceil(maxMatch / limit)
    max = max > 10 ? 10 : max
    for (let page = 0; page < max; page++)
      playerHistory.push(...(await Player.getHistory(playerId, limit, page * limit)).items)
  }

  if (maxMatch == playerStats.lifetime.Matches) {
    if (cache) await cacheHistory.del(cacheName)
    await cacheHistory.set(cacheName, playerHistory, ttl)
  }

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

const getCardWithInfo = async (interaction, actionRow, values, type, id, maxMatch, maxPage = null, page = null, map = null, updateFrom = false) => {
  const playerId = values.s
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64).catch(err => err.statusText)
  const pStats = await Player.getStats(playerId)

  if (maxMatch === null) maxMatch = pStats.lifetime.Matches

  const faceitLevel = playerDatas.games.csgo.skill_level
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const size = 40

  let playerHistory = await getPlayerHistory(playerId, pStats.lifetime.Matches)
  let from = values.f * 1000 || playerHistory.at(-1).date
  const to = values.t * 1000 || new Date().setHours(+24)

  const filteredHistory = playerHistory.filter(e => (map ? e.i1 === map : true) && e.date >= from && e.date < to).slice(0, maxMatch)
  if (map) playerHistory = playerHistory.filter(e => e.i1 === map).slice(0, maxMatch)

  const playerStats = generatePlayerStats(filteredHistory)
  const today = new Date().setHours(24, 0, 0, 0)

  const checkElo = today >= from && today <= to
  const playerHistoryTo = playerHistory.filter(e => e.date < to)
  const elo = Graph.getEloGain(playerStats.games, playerHistoryTo, faceitElo, checkElo)
  const eloDiff = elo.filter(e => e).reduce((a, b) => a + b, 0)

  if (!map) playerHistory = filteredHistory
  if (!playerHistory.length > 0) throw getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname,
  })
  if (updateFrom) from = playerHistory.at(-1).date

  const graphBuffer = Graph.generateChart(playerHistoryTo,
    faceitElo,
    playerStats.games + (type === CustomType.TYPES.ELO),
    type,
    checkElo)

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)
  const toRealTimeStamp = new Date(to).setHours(-24)

  const head = []

  if (from !== toRealTimeStamp) head.push({
    name: 'From - To', value: [new Date(from).toDateString(), '\n', new Date(toRealTimeStamp).toDateString()].join(' '),
    inline: map ? true : false
  })
  else head.push({ name: 'From', value: new Date(from).toDateString(), inline: false })
  if (map) head.push({ name: 'Map', value: map, inline: true }, { name: '\u200b', value: '\u200b', inline: true })

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(...head,
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

const updateOptions = (components, values, updateEmoji = true) => {
  return components.filter(e => e instanceof Discord.StringSelectMenuComponent)
    .map(msm => msm.options.map(o => {
      // Do not reset if a button is clicked
      try { if (JSON.parse(values).id.normalize() === 'uDSG') return o }
      catch (error) { }

      const active = o.value.normalize() === values.normalize()
      if (updateEmoji) o.emoji = active ? emojis.select.balise : undefined
      o.default = active

      return o
    })).at(0)
}

const getFromTo = (interaction, nameFrom = 'from_date', nameTo = 'to_date') => {
  const from = new Date(getInteractionOption(interaction, nameFrom)?.trim())
  const to = new Date(getInteractionOption(interaction, nameTo)?.trim())

  return { from: new Date(from), to: new Date(to) }
}

module.exports = {
  getDates,
  getCardWithInfo,
  setOptionDefault,
  getPlayerHistory,
  generatePlayerStats,
  updateOptions,
  getFromTo,
}
