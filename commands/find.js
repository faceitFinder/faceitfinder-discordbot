const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js')
const { color } = require('../config.json')
const Options = require('../templates/options')
const { getUsers, getInteractionOption, getGameOption } = require('../functions/commands')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const User = require('../database/user')
const { getStats, getFind } = require('../functions/apiHandler')
const { generateChart } = require('../functions/graph')
const { TYPES } = require('../templates/customType')
const { getFaceitPlayerDatas } = require('../functions/player')
const { getLastCard } = require('./last')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const successCard = require('../templates/successCard')

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.push({
    name: 'player_aimed',
    description: getTranslation('options.playerAimed', 'en-US'),
    descriptionLocalizations: getTranslations('options.playerAimed'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, getMapOption(), {
    name: 'excluded_steam_parameters',
    description: getTranslation('options.excludedSteamParameters', 'en-US'),
    descriptionLocalizations: getTranslations('options.excludedSteamParameters'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, {
    name: 'excluded_faceit_parameters',
    description: getTranslation('options.excludedFaceitParameters', 'en-US'),
    descriptionLocalizations: getTranslations('options.excludedFaceitParameters'),
    required: false,
    type: ApplicationCommandOptionType.String,
    slash: true
  }, {
    name: 'match_number',
    description: getTranslation('options.matchNumber', 'en-US', {
      default: 'strings.fullHistory'
    }),
    descriptionLocalizations: getTranslations('options.matchNumber', {
      default: 'strings.fullHistory'
    }),
    required: false,
    type: ApplicationCommandOptionType.Integer,
    slash: true
  })

  return options
}

const sendCardWithInfo = async (
  interaction,
  playerParam,
  matchNumber,
  checkElo,
  map,
  steamIncluded,
  faceitIncluded,
  steamExcluded,
  faceitExcluded,
  game
) => {
  let {
    playerDatas,
    steamDatas,
    playerHistory,
    playerLastStats,
    includedPlayers,
    excludedPlayers,
  } = await getFind({
    playerParam,
    matchNumber,
    checkElo,
    map,
    steamIncluded,
    faceitIncluded,
    steamExcluded,
    faceitExcluded,
    game
  })

  if (!playerHistory.length) return successCard(getTranslation('error.user.noMatchFoundWithOthers', interaction.locale, {
    playerName: playerDatas.nickname,
  }), interaction.locale)

  const playerId = playerDatas.player_id
  const faceitLevel = playerDatas.games[game].skill_level
  const faceitElo = playerDatas.games[game].faceit_elo
  const size = 40
  const graphBuffer = generateChart(
    interaction,
    playerDatas.nickname,
    playerHistory,
    playerLastStats.games,
    TYPES.ELO_KD
  )

  includedPlayers.push(playerId)
  includedPlayers = includedPlayers.filter((v, i, a) => a.indexOf(v) === i)
  excludedPlayers = excludedPlayers.filter((v, i, a) => a.indexOf(v) === i)

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)
  const head = []

  head.push({
    name: 'From - To',
    value: [new Date(playerLastStats.from).toDateString(), '\n', new Date(playerLastStats.to).toDateString()].join(' '),
    inline: !!map
  })

  if (map) head.push({ name: 'Map', value: map, inline: true }, { name: '\u200b', value: '\u200b', inline: true })

  const selectedPlayerStats = new EmbedBuilder()
    .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(
      ...head,
      { name: 'Highest Elo', value: playerLastStats['Highest Elo'].toString(), inline: true },
      { name: 'Lowest Elo', value: playerLastStats['Lowest Elo'].toString(), inline: true },
      { name: 'Current Elo', value: playerLastStats['Current Elo'].toString(), inline: true },
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
      { name: 'Average MVPs', value: playerLastStats['Average MVPs'].toFixed(2), inline: true },
      { name: 'K/D', value: playerLastStats.kd.toFixed(2), inline: true },
      { name: 'Kills', value: playerLastStats.kills.toString(), inline: true },
      { name: 'Deaths', value: playerLastStats.deaths.toString(), inline: true },
      { name: 'Average K/D', value: playerLastStats['Average K/D'].toFixed(2), inline: true },
      { name: 'Average K/R', value: playerLastStats['Average K/R'].toFixed(2), inline: true },
      { name: 'Average HS', value: `${playerLastStats['Average HS'].toFixed(2)}%`, inline: true },
      { name: 'Average Kills', value: playerLastStats['Average Kills'].toFixed(2), inline: true },
      { name: 'Average Deaths', value: playerLastStats['Average Deaths'].toFixed(2), inline: true },
      { name: 'Average Assists', value: playerLastStats['Average Assists'].toFixed(2), inline: true },
      { name: 'Red K/D', value: playerLastStats['Red K/D'].toString(), inline: true },
      { name: 'Orange K/D', value: playerLastStats['Orange K/D'].toString(), inline: true },
      { name: 'Green K/D', value: playerLastStats['Green K/D'].toString(), inline: true })
    .setImage(`attachment://${playerId}graph.png`)
    .setColor(color.levels[faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })

  matchNumber = matchNumber < 1 ? playerLastStats.games : matchNumber

  const {
    embeds,
    files,
    components
  } = await getLastCard({
    interaction,
    playerDatas,
    steamDatas,
    playerHistory,
    mapName: map,
    maxMatch: matchNumber,
    lastSelectorId: 'findSelector',
    pageId: 'pageFind',
    game
  })

  if (includedPlayers.length > 0)
    components.push(
      new ActionRowBuilder()
        .addComponents(await Promise.all(includedPlayers.map(async (p) => {
          const playerDatas = await getFaceitPlayerDatas(p)

          return new ButtonBuilder()
            .setCustomId(JSON.stringify({
              id: 'fUSG',
              s: p,
              l: matchNumber
            }))
            .setLabel(playerDatas.nickname)
            .setStyle(ButtonStyle.Success)
            .setDisabled(playerId === p)
        }))))

  if (excludedPlayers.length > 0)
    components.push(
      new ActionRowBuilder()
        .addComponents(await Promise.all(excludedPlayers.map(async (p) => {
          const playerDatas = await getFaceitPlayerDatas(p)

          return new ButtonBuilder()
            .setCustomId(p)
            .setLabel(playerDatas.nickname)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        }))))


  files.push(new AttachmentBuilder(graphBuffer, { name: `${playerId}graph.png` }),
    new AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` }))

  embeds.unshift(selectedPlayerStats)

  return {
    embeds,
    files,
    components
  }
}

module.exports = {
  name: 'find',
  options: getOptions(),
  description: getTranslation('command.find.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.find.description'),
  usage: '{player_aimed} [<steam_parameters> <faceit_parameters> <team>] <map> <excluded_steam_parameters> <excluded_faceit_parameters> <match_number>',
  example: 'player_aimed: justdams steam_parameters: weder77 faceit_parameters: sheraw excluded_faceit_parameters: KanzakiR3D map: Vertigo match_number: 20',
  type: 'stats',
  async execute(interaction) {
    let currentPlayer = await User.getWithGuild(interaction.user.id, null)
    if (!currentPlayer) currentPlayer = await User.getWithGuild(interaction.user.id, interaction.guild.id)

    let playerParams

    // If player_aimed is not set, we return an error
    try {
      playerParams = await getUsers(interaction, 2, 'player_aimed', 'player_aimed', false)
    } catch {
      throw getTranslation('error.command.requiredParameters', interaction.locale, {
        parameters: 'player_aimed',
        command: 'find'
      })
    }

    const game = getGameOption(interaction)
    const playerParam = (await Promise.all(playerParams.map(playerParam => getStats({
      playerParam,
      matchNumber: 1,
      checkElo: 1,
      game
    }).catch(() => null))
    )).filter(e => e).find(e => e.playerDatas)

    if (!playerParam) return errorCard('error.command.faceitDatasNotFound', interaction.locale)

    const playerAimed = playerParam.playerDatas.player_id
    const searchCurrentUser = !(currentPlayer?.faceitId === playerAimed)

    let teamIncluded, faceitIncluded, steamIncluded

    try {
      teamIncluded = (await getUsers(interaction, 5, null, null, true, null, searchCurrentUser))
        .map(e => e.param)
      faceitIncluded = await Promise.all((await getUsers(interaction, 5 - teamIncluded.length, null, 'faceit_parameters', null, searchCurrentUser))
        .map(async e => {
          if (e?.faceitId) e.param = (await getFaceitPlayerDatas(e.param)).nickname
          return e.param
        }))
      steamIncluded = (await getUsers(interaction, 5 - faceitIncluded.length, 'steam_parameters', null, true, false))
        .map(e => e.param)
    } catch {
      throw getTranslation('error.command.atLeastOneParameter', 'en-GB', {
        parameters: 'steam_parameters, faceit_parameters, team',
        command: 'find'
      })
    }

    const faceitExcluded = (await getUsers(interaction, 5, null, 'excluded_faceit_parameters', null, false))
      .map(e => e.param)
    const steamExcluded = (await getUsers(interaction, 5 - faceitExcluded.length, 'excluded_steam_parameters', null, null, false))
      .map(e => e.param)
    const maxMatch = getInteractionOption(interaction, 'match_number')
    const map = getInteractionOption(interaction, 'map')

    faceitIncluded.push(...teamIncluded)

    return sendCardWithInfo(
      interaction,
      {
        param: playerAimed,
        faceitId: true
      },
      maxMatch,
      1,
      map,
      steamIncluded,
      faceitIncluded,
      steamExcluded,
      faceitExcluded,
      game
    )
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
