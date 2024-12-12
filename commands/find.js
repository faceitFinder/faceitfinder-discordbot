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
const { getUsers } = require('../functions/commands')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const User = require('../database/user')
const { getStats, getFind } = require('../functions/apiHandler')
const { generateChart } = require('../functions/graph')
const { TYPES } = require('../templates/customType')
const { getLastCard } = require('./last')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const successCard = require('../templates/successCard')
const Interaction = require('../database/interaction')
const { getInteractionOption, getGameOption, getCurrentEloString } = require('../functions/utility')
const { generateDateStatsFields } = require('../functions/dateStats')

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

const buildButtons = (faceitIds, game, playerId, style, values, allDisabled = false) => faceitIds.map(async (faceitId) => {
  const { playerDatas } = await getStats({
    playerParam: { param: faceitId, faceitId: true },
    matchNumber: 1,
    game
  })

  const customId = allDisabled ?
    faceitId :
    (await Interaction.create(Object.assign({}, values, { playerIdTarget: faceitId }))).id

  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(playerDatas.nickname)
    .setStyle(style)
    .setDisabled(allDisabled ? true : playerId === faceitId)
})

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
  game,
  page = 0,
  matchId = null
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
    TYPES.ELO_KD,
    game
  )

  includedPlayers.push(playerId)
  includedPlayers = includedPlayers.filter((v, i, a) => a.indexOf(v) === i)
  excludedPlayers = excludedPlayers.filter((v, i, a) => a.indexOf(v) === i)

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size, game)
  const head = []

  head.push({
    name: 'From - To',
    value: [new Date(playerLastStats.from).toDateString(), '\n', new Date(playerLastStats.to).toDateString()].join(' '),
    inline: !!map
  })

  if (map) head.push({ name: 'Map', value: map, inline: true }, { name: '\u200b', value: '\u200b', inline: true })

  const selectedPlayerStats = new EmbedBuilder()
    .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games[game].game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(...generateDateStatsFields(playerLastStats, head))
    .setImage(`attachment://${playerId}graph.png`)
    .setColor(color.levels[game][faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}`, iconURL: 'attachment://game.png' })

  matchNumber = matchNumber < 1 ? playerLastStats.games : matchNumber

  const values = {
    userId: interaction.user.id,
    maxMatch: matchNumber,
    playerId,
    map,
    page,
    game,
    includedPlayers,
    excludedPlayers,
    matchId,
    graphBuffer
  }

  const {
    embeds,
    files,
    components
  } = await getLastCard({
    interaction,
    playerDatas,
    steamDatas,
    playerHistory,
    maxMatch: matchNumber,
    mapName: map,
    matchId,
    page,
    pageId: 'pageFind',
    lastSelectorId: 'findSelector',
    game,
    previousValues: values,
  })

  if (includedPlayers.length > 0)
    components.push(new ActionRowBuilder().addComponents(
      await Promise.all(buildButtons(includedPlayers, game, playerId, ButtonStyle.Success, Object.assign(values, { id: 'fUSG' })))))

  if (excludedPlayers.length > 0)
    components.push(new ActionRowBuilder().addComponents(
      await Promise.all(buildButtons(excludedPlayers, game, playerId, ButtonStyle.Danger, values, true))))

  files.push(
    new AttachmentBuilder(graphBuffer, { name: `${playerId}graph.png` }),
    new AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` })
  )

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
    const searchForCurrentUser = currentPlayer ? currentPlayer.faceitId !== playerAimed : false
    let teamIncluded, faceitIncluded, steamIncluded

    teamIncluded = await Promise.all((await getUsers(interaction, 5, null, null, true, false))
      .map(async e => e.param))
    faceitIncluded = (await getUsers(interaction, 5 - teamIncluded.length, null, 'faceit_parameters', false, false).catch(() => []))
      .map(e => e.param)
    steamIncluded = (await getUsers(interaction, 5 - faceitIncluded.length, 'steam_parameters', null, false, false).catch(() => []))
      .map(e => e.param)

    // In case we don't have any parameters, we add the current user to the list if he's not the player aimed
    if (!faceitIncluded.length && !steamIncluded.length && searchForCurrentUser) {
      faceitIncluded = (await getUsers(interaction, 5, null, 'faceit_parameters', false, true)).map(e => e.param)
      steamIncluded = (await getUsers(interaction, 5 - faceitIncluded.length, 'steam_parameters', null, true)).map(e => e.param)
    }

    if (!teamIncluded.length && !faceitIncluded.length && !steamIncluded.length)
      throw getTranslation('error.command.atLeastOneParameter', interaction.locale, {
        parameters: 'steam_parameters, faceit_parameters, team',
        command: 'find'
      })

    const faceitExcluded = (await getUsers(interaction, 5, null, 'excluded_faceit_parameters', false, false))
      .map(e => e.param)
    const steamExcluded = (await getUsers(interaction, 5 - faceitExcluded.length, 'excluded_steam_parameters', null, false, false))
      .map(e => e.param)
    const maxMatch = getInteractionOption(interaction, 'match_number') ?? 0
    const map = getInteractionOption(interaction, 'map') ?? ''

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
