const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const Options = require('../templates/options')
const { getCardsConditions } = require('../functions/commands')
const { getPagination, getPageSlice, getMaxPage } = require('../functions/pagination')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')
const { generateOption, getInteractionOption, getGameOption } = require('../functions/utility')

const getLevelFromElo = (elo, game) => {
  const colorLevel = Object.entries(color.levels[game]).filter(e => {
    return elo >= e.at(1).min && elo <= e.at(1).max
  }).at(0)
  return colorLevel?.at(0)
}

const getMatchItems = async (interaction, playerDatas, steamDatas, playerHistory, matchId, game) => {
  const size = 40
  const filesAtt = []
  const cards = []
  const faceitElo = playerDatas.games[game].faceit_elo
  const matchStats = playerHistory.filter(e => e.matchId === matchId)

  if (cards.length === 0)
    matchStats.forEach(async (roundStats, i) => {
      const card = new Discord.EmbedBuilder()
      const mapName = roundStats.i1
      const result = Math.max(...roundStats.i18.split('/').map(Number)) === parseInt(roundStats.c5)
      const eloGain = roundStats?.eloGain || 0
      const level = getLevelFromElo(roundStats.elo, game)

      if (level !== undefined) {
        const rankImageCanvas = await Graph.getRankImage(
          level,
          roundStats.elo,
          size,
          game
        )
        filesAtt.push(new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitElo}${i}.png` }))
      }

      if (roundStats === undefined)
        cards.push(errorCard(getTranslation('error.user.lastMatchNoStats', interaction.locale, {
          playerName: playerDatas.nickname,
        }), interaction.locale).embeds.at(0))

      if (matchStats.length > 1)
        card.addFields({ name: 'round', value: `${i + 1}/${matchStats.length}` })

      mapThumbnail = `./images/maps/${mapName}.jpg`
      let entriesWR = Math.ceil((roundStats.i22 / roundStats.i21) * 100).toFixed(0)
      entriesWR = isNaN(entriesWR) ? 0 : entriesWR
      const entries = roundStats.i21 ? `${roundStats.i21} (${entriesWR}%)` : 'N/A'

      card.setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
        .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games[game].game_player_id}), [Game Lobby](https://www.faceit.com/en/${game}/room/${matchId}/scoreboard)`)
        .addFields({ name: 'Score', value: roundStats.i18, inline: true },
          { name: 'Date', value: new Date(roundStats.date).toDateString(), inline: true },
          { name: 'Elo Gain', value: isNaN(eloGain) ? '0' : eloGain > 0 ? `+${eloGain}` : eloGain.toString(), inline: true },
          { name: 'K/D', value: roundStats.c2, inline: true },
          { name: 'K/R', value: roundStats.c3, inline: true },
          { name: 'HS', value: `${roundStats.i13} (${roundStats.c4}%)`, inline: true },
          { name: 'Kills', value: roundStats.i6, inline: true },
          { name: 'Deaths', value: roundStats.i8, inline: true },
          { name: 'Assists', value: roundStats.i7, inline: true },
          // Removed from faceit endpoint used by the api
          // { name: 'Damages', value: roundStats?.i20 ?? 'N/A', inline: true },
          { name: 'ADR', value: roundStats?.c10 ?? 'N/A', inline: true },
          // { name: 'Entries (WR)', value: entries, inline: true },
        )
        .setThumbnail(`attachment://${faceitElo}${i}.png`)
        .setImage(`attachment://${mapName}${i}.jpg`)
        .setColor(result ? color.won : color.lost)
        .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}`, iconURL: `attachment://game${i}.png` })

      if (fs.existsSync(mapThumbnail))
        filesAtt.push(
          new Discord.AttachmentBuilder(mapThumbnail, { name: `${mapName}${i}.jpg` }),
          new Discord.AttachmentBuilder(`images/${game}.png`, { name: `game${i}.png` })
        )

      cards.push(card)
    })

  return {
    embeds: cards,
    files: filesAtt
  }
}

const sendCardWithInfo = async (
  interaction,
  playerParam,
  matchId = null,
  page = 0,
  mapName = null,
  lastSelectorId = 'lastSelector',
  pageId = 'pageLast',
  maxMatch = null,
  game = null,
  previousValues = {}
) => {
  const map = getInteractionOption(interaction, 'map')
  game ??= getGameOption(interaction)
  maxMatch = getInteractionOption(interaction, 'match_number') ?? maxMatch ?? 25
  if (map) mapName = map
  mapName ??= ''

  maxMatch = maxMatch < 1 ? 0 : maxMatch

  let {
    playerDatas,
    steamDatas,
    playerHistory,
    playerLastStats
  } = await getStats({
    playerParam,
    matchNumber: maxMatch,
    map: mapName,
    startDate: '',
    endDate: '',
    checkElo: +(page === 0),
    game
  })

  if (!playerHistory.length > 0) return errorCard(getTranslation('error.user.lastMatchNoStats', interaction.locale, {
    playerName: playerDatas.nickname,
  }), interaction.locale)

  return getLastCard({
    interaction,
    mapName,
    maxMatch: maxMatch ?? playerLastStats.games,
    playerDatas,
    matchId,
    steamDatas,
    playerHistory,
    page,
    lastSelectorId,
    pageId,
    game,
    previousValues
  })
}

const getLastCard = async ({
  interaction,
  playerDatas,
  steamDatas,
  playerHistory,
  maxMatch,
  mapName = '',
  matchId = null,
  page = 0,
  lastSelectorId = 'lastSelector',
  pageId = 'pageLast',
  game,
  previousValues = {}
}) => {
  const playerId = playerDatas.player_id
  const files = []
  const pagination = getPageSlice(page)

  // Removing multiple ids
  let filteredHistory = playerHistory.map(e => e.matchId).filter((e, i, a) => a.indexOf(e) === i).slice(0, maxMatch || playerHistory.length)
  const maxPage = getMaxPage(filteredHistory)
  filteredHistory = filteredHistory.slice(pagination.start, pagination.end)

  if (!matchId) matchId = filteredHistory.at(0)

  const values = Object.assign({}, previousValues, {
    userId: interaction.user.id,
    playerId,
    map: mapName,
    maxMatch,
    game,
    currentPage: page,
    maxPage
  })

  const matchItems = await getMatchItems(interaction, playerDatas, steamDatas, playerHistory, matchId, game)
  matchItems.files.push(...files)

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
      defaultOption: e === matchId,
      values: Object.assign({}, values, { matchId: e })
    }
  })

  const paginationOptionsRaw = options
  const paginationOptions = await Promise.all(paginationOptionsRaw.map(option => generateOption(interaction, option)))

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId(lastSelectorId)
          .setPlaceholder(getTranslation('strings.selectAnotherMatch', interaction.locale))
          .addOptions(paginationOptions)),
    await getPagination(interaction, page, maxPage, pageId, values)
  ]

  return {
    ...matchItems,
    components,
  }
}

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.unshift(getMapOption(), {
    name: 'match_number',
    description: getTranslation('options.matchNumber', 'en-US', {
      default: '25'
    }),
    descriptionLocalizations: getTranslations('options.matchNumber', {
      default: '25'
    }),
    required: false,
    type: Discord.ApplicationCommandOptionType.Integer,
    slash: true,
  })

  return options
}

module.exports = {
  name: 'last',
  options: getOptions(),
  description: getTranslation('command.last.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.last.description'),
  usage: `${Options.usage} <map> <match_number>`,
  example: 'steam_parameters: justdams',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions({
      interaction,
      fn: sendCardWithInfo
    })
  },
}

module.exports.sendCardWithInfo = sendCardWithInfo
module.exports.getMatchItems = getMatchItems
module.exports.getLastCard = getLastCard
