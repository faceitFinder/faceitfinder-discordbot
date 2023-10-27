const Discord = require('discord.js')
const { color, emojis } = require('../config.json')
const { getUsers, getInteractionOption, getGameOption } = require('../functions/commands')
const CustomTypeFunc = require('../functions/customType')
const CustomType = require('../templates/customType')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getMapOption } = require('../functions/map')
const { getStats } = require('../functions/apiHandler')
const { gameOption } = require('../templates/options')

const compareStats = (stats1, stats2, positive = true) => {
  if (positive) {
    if (stats1 > stats2) return emojis.better.balise
    else if (stats1 < stats2) return emojis.worse.balise
  } else {
    if (stats1 > stats2) return emojis.worse.balise
    else if (stats1 < stats2) return emojis.better.balise
  }

  return emojis.even.balise
}

const getRandomColors = (length) => {
  const colors = []
  do {
    const pColor = color.players[Math.floor(Math.random() * 5) + 1]
    if (!colors.includes(pColor)) colors.push(pColor)
  } while (colors.length < length)
  return colors
}

const getMaxMatchLimit = (player1, player2, fn) => {
  const playerMaxMatches = [player1, player2]
    .map(p => fn(p))
  const maxMatchLimit = structuredClone(playerMaxMatches).sort((a, b) => a - b)[0]
  return maxMatchLimit
}

const buildButtons = (interaction, buttonsValues) => Promise.all([
  CustomType.TYPES.KD,
  CustomType.TYPES.ELO
].map((t) => CustomTypeFunc.generateButtons(interaction, buttonsValues, t, CustomType.TYPES.ELO)))

const getPlayersStats = ({
  players,
  matchNumber,
  game,
  map = ''
}) => Promise.all(players.map((player) => getStats({
  playerParam: player,
  matchNumber,
  map,
  game
})))

const getInitPlayersDatas = ({
  player1Param,
  player2Param,
  game,
  map
}) => getPlayersStats({
  players: [player1Param, player2Param],
  matchNumber: 1,
  game,
  map
})

const buildEmbed = async ({
  player1,
  player2,
  maxMatch,
  map,
  type,
  game,
  locale,
  playerColor = getRandomColors(2)
}) => {
  // Check if players have played at least one match
  [player1, player2].filter(p => !p.playerHistory.length).map(p => {
    throw getTranslation('error.user.noMatches', locale, {
      playerName: p.playerDatas.nickname,
    })
  })

  let filter = (p) => parseInt(p.playerStats.lifetime.Matches)

  if (map) {
    // Check if players have played the map
    [player1, player2].map(p => {
      mapStats = p.playerStats.segments.filter(segment => segment.label === map && segment.mode === '5v5')

      if (!mapStats?.at(0)?.stats) throw getTranslation('error.user.mapNotPlayed', locale, {
        playerName: p.playerDatas.nickname,
      })
    })

    filter = (p) => parseInt(p.playerStats.segments.find(segment => segment.label === map && segment.mode === '5v5').stats.Matches)
  }

  const maxMatchLimit = getMaxMatchLimit(
    player1,
    player2,
    (p) => filter(p)
  )

  if (maxMatch > maxMatchLimit || maxMatch <= 0) {
    maxMatch = maxMatchLimit
  }

  // Get player stats
  [player1, player2] = await getPlayersStats({
    players: [{ faceitId: true, param: player1.playerDatas.player_id }, { faceitId: true, param: player2.playerDatas.player_id }],
    matchNumber: maxMatch,
    map,
    game
  })

  const fields = [{
    name: 'Matches Compared',
    value: maxMatch.toString(),
    inline: !!map
  }]

  if (map) fields.push({ name: 'Map', value: map, inline: true }, { name: '\u200B', value: '\u200B', inline: true })

  fields.push(
    {
      name: 'Winrate',
      value: `**${player1.playerLastStats.winrate.toFixed(2)}%** - \
      ${player2.playerLastStats.winrate.toFixed(2)}% \
      ${compareStats(player1.playerLastStats.winrate, player2.playerLastStats.winrate)}`,
      inline: true
    },
    {
      name: 'Elo',
      value: `**${player1.playerDatas.games[game].faceit_elo}** - \
      ${player2.playerDatas.games[game].faceit_elo} \
      ${compareStats(player1.playerDatas.games[game].faceit_elo, player2.playerDatas.games[game].faceit_elo)}`,
      inline: true
    },
    {
      name: 'Average MVPs',
      value: `**${player1.playerLastStats['Average MVPs'].toFixed(2)}** - \
      ${player2.playerLastStats['Average MVPs'].toFixed(2)} \
      ${compareStats(player1.playerLastStats['Average MVPs'], player2.playerLastStats['Average MVPs'])}`,
      inline: true
    },
    {
      name: 'K/D', value: `**${player1.playerLastStats.kd.toFixed(2)}** - \
      ${player2.playerLastStats.kd.toFixed(2)} \
      ${compareStats(player1.playerLastStats.kd, player2.playerLastStats.kd)}`,
      inline: true
    },
    {
      name: 'Kills', value: `**${player1.playerLastStats.kills}** - \
      ${player2.playerLastStats.kills} \
      ${compareStats(player1.playerLastStats.kills, player2.playerLastStats.kills)}`,
      inline: true
    },
    {
      name: 'Deaths', value: `**${player1.playerLastStats.deaths}** - \
      ${player2.playerLastStats.deaths} \
      ${compareStats(player1.playerLastStats.deaths, player2.playerLastStats.deaths, false)}`,
      inline: true
    },
    {
      name: 'Average K/D',
      value: `**${player1.playerLastStats['Average K/D'].toFixed(2)}** - \
      ${player2.playerLastStats['Average K/D'].toFixed(2)} \
      ${compareStats(player1.playerLastStats['Average K/D'], player2.playerLastStats['Average K/D'])}`,
      inline: true
    },
    {
      name: 'Average K/R',
      value: `**${player1.playerLastStats['Average K/R'].toFixed(2)}** - \
      ${player2.playerLastStats['Average K/R'].toFixed(2)} \
      ${compareStats(player1.playerLastStats['Average K/R'], player2.playerLastStats['Average K/R'])}`,
      inline: true
    },
    {
      name: 'Average HS',
      value: `**${player1.playerLastStats['Average HS'].toFixed(2)}%** - \
      ${player2.playerLastStats['Average HS'].toFixed(2)}% \
      ${compareStats(player1.playerLastStats['Average HS'], player2.playerLastStats['Average HS'])}`,
      inline: true
    },
    {
      name: 'Average Kills',
      value: `**${player1.playerLastStats['Average Kills'].toFixed(2)}** - \
      ${player2.playerLastStats['Average Kills'].toFixed(2)} \
      ${compareStats(player1.playerLastStats['Average Kills'], player2.playerLastStats['Average Kills'])}`,
      inline: true
    },
    {
      name: 'Average Deaths',
      value: `**${player1.playerLastStats['Average Deaths'].toFixed(2)}** - \
      ${player2.playerLastStats['Average Deaths'].toFixed(2)} \
      ${compareStats(player1.playerLastStats['Average Deaths'], player2.playerLastStats['Average Deaths'], false)}`,
      inline: true
    },
    {
      name: 'Average Assists',
      value: `**${player1.playerLastStats['Average Assists'].toFixed(2)}** - \
      ${player2.playerLastStats['Average Assists'].toFixed(2)} \
      ${compareStats(player1.playerLastStats['Average Assists'], player2.playerLastStats['Average Assists'])}`,
      inline: true
    },
    {
      name: 'Red K/D',
      value: `**${player1.playerLastStats['Red K/D']}** - \
      ${player2.playerLastStats['Red K/D']} \
      ${compareStats(player1.playerLastStats['Red K/D'], player2.playerLastStats['Red K/D'], false)}`,
      inline: true
    },
    {
      name: 'Orange K/D',
      value: `**${player1.playerLastStats['Orange K/D']}** - \
      ${player2.playerLastStats['Orange K/D']} \
      ${compareStats(player1.playerLastStats['Orange K/D'], player2.playerLastStats['Orange K/D'], false)}`,
      inline: true
    },
    {
      name: 'Green K/D',
      value: `**${player1.playerLastStats['Green K/D']}** - \
      ${player2.playerLastStats['Green K/D']} \
      ${compareStats(player1.playerLastStats['Green K/D'], player2.playerLastStats['Green K/D'])}`,
      inline: true
    }
  )

  const card = new Discord.EmbedBuilder()
    .setAuthor({
      name: player1.playerDatas.nickname,
      iconURL: player1.playerDatas.avatar || null
    })
    .setDescription(getTranslation('strings.compare', locale, {
      playerName1: `[${player1.playerDatas.nickname}](https://www.faceit.com/en/players/${player1.playerDatas.nickname})`,
      playerName2: `[${player2.playerDatas.nickname}](https://www.faceit.com/en/players/${player2.playerDatas.nickname})`
    }))
    .setColor(color.primary)
    .addFields(...fields)
    .setImage('attachment://graph.png')
    .setFooter({ text: '\u200b', iconURL: 'attachment://game.png' })

  const datasets = [player1, player2]
    .map((user, i) => [
      user.playerDatas.nickname,
      type,
      playerColor[i],
      Graph.getGraph(
        locale,
        user.playerDatas.nickname,
        type,
        user.playerHistory,
        maxMatch
      ).reverse()
    ])

  console.log(datasets)

  const graphBuffer = Graph.getChart(
    datasets,
    new Array(maxMatch).fill(''),
    Graph.getCompareDatasets,
    false,
    game
  )

  const files = [
    new Discord.AttachmentBuilder(graphBuffer, { name: 'graph.png' }),
    new Discord.AttachmentBuilder(`images/${game}.png`, { name: 'game.png' })
  ]

  const buttonValues = {
    id: 'uCSG',
    maxMatch,
    game,
    map,
    p1: player1.playerDatas.player_id,
    p2: player2.playerDatas.player_id,
    playerColor,
  }

  return {
    card,
    files,
    buttonValues
  }
}

const sendCardWithInfo = async (
  interaction,
  player1Param,
  player2Param,
  type = CustomType.TYPES.ELO,
  maxMatch = null,
  map = null,
  game = null
) => {
  const defaultMaxMatch = 20

  game ??= getGameOption(interaction)
  maxMatch ??= getInteractionOption(interaction, 'match_number') ?? defaultMaxMatch
  map ??= getInteractionOption(interaction, 'map') ?? ''

  const [player1, player2] = await getInitPlayersDatas({
    player1Param,
    player2Param,
    game,
    map
  })

  const {
    card,
    files,
    buttonValues
  } = await buildEmbed({
    player1,
    player2,
    maxMatch,
    map,
    type,
    game,
    locale: interaction.locale
  })

  return {
    embeds: [card],
    files,
    components: [
      new Discord.ActionRowBuilder()
        .addComponents(await buildButtons(interaction, buttonValues))
    ]
  }
}

module.exports = {
  name: 'compare',
  options: [
    {
      name: 'match_number',
      description: getTranslation('options.matchNumber', 'en-US', {
        default: '20'
      }),
      descriptionLocalizations: getTranslations('options.matchNumber', {
        default: '20'
      }),
      required: false,
      type: Discord.ApplicationCommandOptionType.Integer,
      slash: true,
    },
    {
      name: 'first_user_steam',
      description: getTranslation('options.steamParameter', 'en-US'),
      descriptionLocalizations: getTranslations('options.steamParameter'),
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'first_user_faceit',
      description: getTranslation('options.faceitParameter', 'en-US'),
      descriptionLocalizations: getTranslations('options.faceitParameter'),
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'second_user_steam',
      description: getTranslation('options.steamParameter', 'en-US'),
      descriptionLocalizations: getTranslations('options.steamParameter'),
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'second_user_faceit',
      description: getTranslation('options.faceitParameter', 'en-US'),
      descriptionLocalizations: getTranslations('options.faceitParameter'),
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    getMapOption(),
    gameOption],
  description: getTranslation('command.compare.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.compare.description'),
  usage: '<match_number> {<first_user_steam> <first_user_faceit>} [<second_user_steam> <second_user_faceit>] <map>',
  example: 'match_number: 100 first_user_steam: justdams second_user_steam: sheraw map: Vertigo',
  type: 'stats',
  async execute(interaction) {
    const player1 = (await getUsers(interaction, 1, 'first_user_steam', 'first_user_faceit'))?.at(0)
    const player2 = (await getUsers(interaction, 1, 'second_user_steam', 'second_user_faceit'))?.at(0)

    if (!player1 || !player2) return errorCard('error.user.missing', interaction.locale)
    else if (player1.param === player2.param) return errorCard('error.user.compareSame', interaction.locale)

    return sendCardWithInfo(interaction, player1, player2)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
module.exports.buildEmbed = buildEmbed
module.exports.buildButtons = buildButtons
module.exports.getInitPlayersDatas = getInitPlayersDatas