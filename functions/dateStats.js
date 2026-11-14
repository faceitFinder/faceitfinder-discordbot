const { color, defaultGame, itemByPage } = require('../config.json')
const Discord = require('discord.js')
const Graph = require('./graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const { getPagination } = require('./pagination')
const { getStats, getSeasons } = require('./apiHandler')
const { getTranslation } = require('../languages/setup')
const { generateOption, setOptionDefault, getInteractionOption, getCurrentEloString, getGameOption } = require('./utility')
const errorCard = require('../templates/errorCard')

const getDates = async (playerHistory, getDay) => {
  const dates = new Map()

  playerHistory.forEach(e => {
    const day = getDay(e.date)
    if (!dates.has(day)) dates.set(day, { number: 1, date: day })
    else dates.set(day, { number: dates.get(day).number + 1, date: day })
  })

  return dates
}

/** Matches asked to the API in the first round, for each page to fill */
const FIRST_MATCH_NUMBER = 100
const MAX_ROUNDS = 8

/**
 * Played periods (days, weeks, months, years) of the player, newest first, enough to fill `page`.
 *
 * Only the latest matches are asked to the API, more and more until the page is full or the
 * history is over: the API only completes its cache with the older matches that are missing.
 * One period more than the page holds is needed, so that the last period of the page is complete.
 */
const getPlayedPeriods = async ({ playerParam, game, map, page, functionToGetDates }) => {
  const needed = (page + 1) * itemByPage + 1
  let matchNumber = FIRST_MATCH_NUMBER * (page + 1)
  let result

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const { playerDatas, playerHistory = [] } = await getStats({ playerParam, matchNumber, game, map })
    const matches = playerHistory.slice(0, matchNumber)
    // Without map filter the API adds the match before the last one asked, when there is one
    const ended = map ? matches.length < matchNumber : playerHistory.length <= matchNumber
    const periods = [...(await getDates(matches, functionToGetDates)).values()]

    result = { playerDatas, periods, ended }
    if (ended || periods.length >= needed) break

    // Matches the page needs, from the matches per period seen so far
    const perPeriod = matches.length / Math.max(periods.length, 1)
    matchNumber = Math.max(matchNumber * 2, Math.ceil((needed * perPeriod * 1.5) / 100) * 100)
  }

  return result
}

const getCardWithInfo = async ({
  interaction,
  values,
  type = CustomType.TYPES.ELO,
  updateStartDate = false
}) => {
  const playerId = values.playerId
  const today = new Date().setHours(24, 0, 0, 0)
  let startDate = values.from || ''
  const endDate = values.to || new Date().setHours(+24)
  const map = values.map ?? ''
  const game = values.game ?? defaultGame
  const playerParam = { param: playerId, faceitId: true }

  const {
    playerDatas,
    steamDatas,
    playerHistory,
    playerLastStats
  } = await getStats({
    playerParam,
    matchNumber: values.maxMatch,
    startDate,
    endDate,
    map: map,
    checkElo: +((startDate !== '' ? today >= startDate : true) && today <= endDate),
    game
  })

  const embeds = []
  const files = []

  if (!playerLastStats.games) {
    const error = errorCard(getTranslation('error.user.noMatches', interaction.locale, { playerName: playerDatas.nickname }), interaction.locale)
    embeds.push(...error.embeds)
    files.push(...error.files)
  } else {
    const faceitLevel = playerDatas.games[game].skill_level
    const faceitElo = playerDatas.games[game].faceit_elo
    const playerRegion = playerDatas.games[game].region
    const size = 40

    const graphBuffer = Graph.generateChart(
      interaction.locale,
      playerDatas.nickname,
      playerHistory,
      playerLastStats.games + (CustomType.getType(type.name) === CustomType.TYPES.ELO),
      type,
      game
    )

    const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size, game, playerParam, playerRegion)
    const endDateToRealTimeStamp = new Date(endDate).setHours(-24)

    const head = []

    if (updateStartDate) startDate = new Date(playerLastStats.from).getTime()
    if (values.seasonNumber) head.push({ name: 'Season', value: values.seasonNumber.toString(), inline: true })

    if (values.seasonNumber == null) {
      if (startDate !== endDateToRealTimeStamp) head.push({
        name: 'From - To', value: [new Date(startDate).toDateString(), '\n', new Date(endDateToRealTimeStamp).toDateString()].join(' '),
        inline: true
      })
      else head.push({ name: 'From', value: new Date(startDate).toDateString(), inline: true })
    }

    if (map) head.push({ name: 'Map', value: map, inline: true })
    if (head.length < 3 && head.length > 0) {
      const missing = Math.max(0, 3 - head.length)
      for (let i = 0; i < missing; i++) head.push({ name: '\u200b', value: '\u200b', inline: true })
    }

    const card = new Discord.EmbedBuilder()
      .setAuthor({
        name: playerDatas.nickname,
        iconURL: playerDatas.avatar || null,
        url: `https://www.faceit.com/en/players/${playerDatas.nickname}`
      })
      .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games[game].game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
      .setThumbnail(`attachment://${faceitLevel}level.png`)
      .addFields(...generateDateStatsFields(playerLastStats, head))
      .setImage(`attachment://${values.playerId}graph.png`)
      .setColor(color.levels[game][faceitLevel].color)
      .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}`, iconURL: 'attachment://game.png' })

    embeds.push(card)

    files.push(...[
      new Discord.AttachmentBuilder(graphBuffer, { name: `${values.playerId}graph.png` }),
      new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` }),
      new Discord.AttachmentBuilder(`images/${game}.png`, { name: 'game.png' })
    ])
  }

  return {
    from: startDate,
    to: endDate,
    content: '',
    embeds,
    files
  }
}

const generateDatasForCard = async ({
  interaction,
  playerParam,
  page = 0,
  game = '',
  functionToGetDates,
  formatFromToDates,
  formatLabel,
  selectTranslationString,
  type,
  defaultOption = 0,
  map = ''
}) => {
  type ??= CustomType.TYPES.ELO
  page ??= 0

  const { playerDatas, periods, ended } = await getPlayedPeriods({
    playerParam, game, map, page, functionToGetDates
  })

  if (!periods.length) throw getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  })

  // Last page: known once the whole history was read, else at least the next one
  const maxPage = ended ? Math.ceil(periods.length / itemByPage) - 1 : page + 1
  page = Math.max(0, Math.min(page, Math.ceil(periods.length / itemByPage) - 1))
  const dates = periods.slice(page * itemByPage, (page + 1) * itemByPage)

  const playerId = playerDatas.player_id
  const optionsValues = []
  const maxMatch = 0

  dates.forEach(date => {
    const {
      from,
      to
    } = formatFromToDates(date)

    let option = {
      label: formatLabel(from, to, interaction.locale),
      description: getTranslation('strings.matchPlayed', interaction.locale, { matchNumber: date.number }),
      values: {
        playerId,
        from,
        to,
        game,
        maxMatch,
        map,
        type
      }
    }

    optionsValues.push(option)
  })

  optionsValues.forEach(option => {
    option.values.maxPage = maxPage
    option.values.currentPage = page
  })

  if (!optionsValues[defaultOption]) defaultOption = 0
  const values = optionsValues[defaultOption].values
  const pagination = await Promise.all(optionsValues.map(option => generateOption(interaction, option)))

  pagination[defaultOption] = setOptionDefault(pagination.at(defaultOption))

  const resp = await getCardWithInfo({
    interaction,
    values,
    type
  })

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('dateStatsSelector')
          .setPlaceholder(getTranslation(selectTranslationString, interaction.locale))
          .addOptions(pagination)),
    new Discord.ActionRowBuilder()
      .addComponents(await CustomTypeFunc.buildButtonsGraph(interaction, Object.assign({}, values, {
        id: 'uDSG',
        maxPage,
        currentPage: page
      }), type))
  ]

  if (page !== null) components.push(await getPagination(interaction, page, maxPage, 'pageDS', values))

  resp.components = components

  return resp
}

const getFromTo = async (interaction, nameFrom = 'from_date', nameTo = 'to_date', nameSeason = 'season') => {
  let from = new Date(getInteractionOption(interaction, nameFrom)?.trim())
  let to = new Date(getInteractionOption(interaction, nameTo)?.trim())
  let allSeason = false

  if (getGameOption(interaction) == 'cs2') {
    const seasonNumber = parseInt(getInteractionOption(interaction, nameSeason))
    if (!isNaN(seasonNumber)) {
      const seasons = await getSeasons()
      const selectedSeason = seasons?.payload?.cs2?.seasons?.find(e => e.number === seasonNumber)
      if (!selectedSeason) throw getTranslation('error.execution.command', interaction.locale)

      from = selectedSeason.from
      to = selectedSeason.to
      allSeason = true
    }
  }

  return { from: new Date(from).getTime() || 0, to: new Date(to).getTime() || new Date().setHours(+24), allSeason }
}

const generateDateStatsFields = (playerLastStats, head) => {
  const entries = playerLastStats['Average Entries'] ? `${playerLastStats['Average Entries']} (${playerLastStats['Average Entries WR']}%)` : 'N/A'

  return [
    ...head,
    { name: 'Highest Elo', value: playerLastStats['Highest Elo']?.toString() ?? 'N/A', inline: true },
    { name: 'Lowest Elo', value: playerLastStats['Lowest Elo']?.toString() ?? 'N/A', inline: true },
    { name: 'Current Elo', value: getCurrentEloString(playerLastStats), inline: true },
    { name: 'Games', value: `${playerLastStats.games} (${playerLastStats.winrate.toFixed(2)}% Win)`, inline: true },
    {
      name: 'Elo Gain',
      value: isNaN(playerLastStats.eloGain) ?
        '0'
        : playerLastStats.eloGain > 0 ?
          `+${playerLastStats.eloGain}`
          : playerLastStats.eloGain.toString(),
      inline: true
    },
    { name: 'Avg MVPs', value: playerLastStats['Average MVPs'].toFixed(2), inline: true },
    { name: 'K/D', value: playerLastStats.kd?.toFixed(2) ?? 'N/A', inline: true },
    { name: 'Kills', value: playerLastStats.kills.toString(), inline: true },
    { name: 'Deaths', value: playerLastStats.deaths.toString(), inline: true },
    { name: 'Avg K/D', value: playerLastStats['Average K/D'].toFixed(2), inline: true },
    { name: 'Avg K/R', value: playerLastStats['Average K/R'].toFixed(2), inline: true },
    { name: 'Avg HS', value: `${playerLastStats['Average HS'].toFixed(2)}%`, inline: true },
    { name: 'Avg Kills', value: playerLastStats['Average Kills'].toFixed(2), inline: true },
    { name: 'Avg Deaths', value: playerLastStats['Average Deaths'].toFixed(2), inline: true },
    { name: 'Avg Assists', value: playerLastStats['Average Assists'].toFixed(2), inline: true },
    // { name: 'Avg Damages', value: playerLastStats['Average Damages']?.toString() ?? 'N/A', inline: true },
    { name: 'Avg ADR', value: playerLastStats['Average ADR']?.toString() ?? 'N/A', inline: false },
    // { name: 'Avg Entries (WR)', value: entries, inline: true },
    { name: 'Red K/D', value: playerLastStats['Red K/D'].toString(), inline: true },
    { name: 'Orange K/D', value: playerLastStats['Orange K/D'].toString(), inline: true },
    { name: 'Green K/D', value: playerLastStats['Green K/D'].toString(), inline: true },
  ]
}

module.exports = {
  getDates,
  getPlayedPeriods,
  getCardWithInfo,
  getFromTo,
  generateDatasForCard,
  generateDateStatsFields
}
