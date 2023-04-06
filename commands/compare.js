const Discord = require('discord.js')
const { color, emojis } = require('../config.json')
const { getUsers, getInteractionOption } = require('../functions/commands')
const Player = require('../functions/player')
const DateStats = require('../functions/dateStats')
const CustomTypeFunc = require('../functions/customType')
const CustomType = require('../templates/customType')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getMapOption } = require('../functions/map')

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

const getPlayerDatas = async (playerId, maxMatch, map) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)
  const playerHistory = await DateStats.getPlayerHistory(playerId, map ? null : maxMatch)
  let filteredHistory = playerHistory

  if (map !== null) filteredHistory = playerHistory.filter(e => e.i1 === map).slice(0, maxMatch)

  return {
    playerId,
    playerDatas,
    playerStats,
    playerHistory: filteredHistory,
    maxMatch: filteredHistory.length
  }
}

const getRandomColors = (length) => {
  const colors = []
  do {
    const pColor = color.players[Math.floor(Math.random() * 5) + 1]
    if (!colors.includes(pColor)) colors.push(pColor)
  } while (colors.length < length)
  return colors
}

const sendCardWithInfo = async (interaction, player1Id, player2Id, type = CustomType.TYPES.ELO, maxMatch = 20, map = null) => {
  maxMatch = getInteractionOption(interaction, 'match_number') || maxMatch
  map = getInteractionOption(interaction, 'map') || map

  const firstUserDatas = await getPlayerDatas(player1Id, maxMatch, map)
  const secondUserDatas = await getPlayerDatas(player2Id, maxMatch, map)
  const playerWithLessMatch = [firstUserDatas, secondUserDatas]
    .sort((a, b) => a.maxMatch - b.maxMatch)[0]
  const buttonValues = { id: 'uCSG', u: interaction.user.id }

  if (map) buttonValues.c = map

  maxMatch = playerWithLessMatch.maxMatch

  const dateStatsDatas = [firstUserDatas, secondUserDatas]
    .map(userDatas => DateStats.generatePlayerStats(userDatas.playerHistory.slice(0, maxMatch)))

  const head = [{
    name: 'Matches Compared',
    value: playerWithLessMatch.playerHistory.length.toString(),
    inline: true
  }]

  if (map) head.push({ name: 'Map', value: map, inline: true })

  const card = new Discord.EmbedBuilder()
    .setAuthor({
      name: firstUserDatas.playerDatas.nickname,
      iconURL: firstUserDatas.playerDatas.avatar || null
    })
    .setDescription(getTranslation('strings.compare', interaction.locale, {
      playerName1: `[${firstUserDatas.playerDatas.nickname}](https://www.faceit.com/en/players/${firstUserDatas.playerDatas.nickname})`,
      playerName2: `[${secondUserDatas.playerDatas.nickname}](https://www.faceit.com/en/players/${secondUserDatas.playerDatas.nickname})`
    }))
    .setColor(color.primary)
    .addFields(
      ...head,
      {
        name: 'From',
        value: new Date(playerWithLessMatch.playerHistory.at(-1).date).toDateString(),
        inline: false
      },
      {
        name: 'Winrate',
        value: `**${dateStatsDatas.at(0).winrate}%** - \
        ${dateStatsDatas.at(1).winrate}% \
        ${compareStats(dateStatsDatas.at(0).winrate, dateStatsDatas.at(1).winrate)}`,
        inline: true
      },
      {
        name: 'Elo',
        value: `**${firstUserDatas.playerDatas.games.csgo.faceit_elo}** - \
        ${secondUserDatas.playerDatas.games.csgo.faceit_elo} ${compareStats(firstUserDatas.playerDatas.games.csgo.faceit_elo, secondUserDatas.playerDatas.games.csgo.faceit_elo)}`,
        inline: true
      },
      {
        name: 'Average MVPs',
        value: `**${dateStatsDatas.at(0)['Average MVPs']}** - \
        ${dateStatsDatas.at(1)['Average MVPs']} ${compareStats(dateStatsDatas.at(0)['Average MVPs'], dateStatsDatas.at(1)['Average MVPs'])}`,
        inline: true
      },
      {
        name: 'K/D', value: `**${dateStatsDatas.at(0).kd}** - \
      ${dateStatsDatas.at(1).kd} ${compareStats(dateStatsDatas.at(0).kd, dateStatsDatas.at(1).kd)}`, inline: true
      },
      {
        name: 'Kills', value: `**${dateStatsDatas.at(0).kills}** - \
      ${dateStatsDatas.at(1).kills} ${compareStats(dateStatsDatas.at(0).kills, dateStatsDatas.at(1).kills)}`, inline: true
      },
      {
        name: 'Deaths', value: `**${dateStatsDatas.at(0).deaths}** - \
      ${dateStatsDatas.at(1).deaths} ${compareStats(dateStatsDatas.at(0).deaths, dateStatsDatas.at(1).deaths, false)}`, inline: true
      },
      {
        name: 'Average K/D',
        value: `**${dateStatsDatas.at(0)['Average K/D']}** - \
        ${dateStatsDatas.at(1)['Average K/D']} ${compareStats(dateStatsDatas.at(0)['Average K/D'], dateStatsDatas.at(1)['Average K/D'])}`,
        inline: true
      },
      {
        name: 'Average K/R',
        value: `**${dateStatsDatas.at(0)['Average K/R']}** - \
        ${dateStatsDatas.at(1)['Average K/R']} ${compareStats(dateStatsDatas.at(0)['Average K/R'], dateStatsDatas.at(1)['Average K/R'])}`,
        inline: true
      },
      {
        name: 'Average HS',
        value: `**${dateStatsDatas.at(0)['Average HS']}%** - \
        ${dateStatsDatas.at(1)['Average HS']}% ${compareStats(dateStatsDatas.at(0)['Average HS'], dateStatsDatas.at(1)['Average HS'])}`,
        inline: true
      },
      {
        name: 'Average Kills',
        value: `**${dateStatsDatas.at(0)['Average Kills']}** - \
        ${dateStatsDatas.at(1)['Average Kills']} ${compareStats(dateStatsDatas.at(0)['Average Kills'], dateStatsDatas.at(1)['Average Kills'])}`,
        inline: true
      },
      {
        name: 'Average Deaths',
        value: `**${dateStatsDatas.at(0)['Average Deaths']}** - \
        ${dateStatsDatas.at(1)['Average Deaths']} ${compareStats(dateStatsDatas.at(0)['Average Deaths'], dateStatsDatas.at(1)['Average Deaths'], false)}`,
        inline: true
      },
      {
        name: 'Average Assists',
        value: `**${dateStatsDatas.at(0)['Average Assists']}** - \
        ${dateStatsDatas.at(1)['Average Assists']} ${compareStats(dateStatsDatas.at(0)['Average Assists'], dateStatsDatas.at(1)['Average Assists'])}`,
        inline: true
      },
      {
        name: 'Red K/D',
        value: `**${dateStatsDatas.at(0)['Red K/D']}** - \
        ${dateStatsDatas.at(1)['Red K/D']} ${compareStats(dateStatsDatas.at(0)['Red K/D'], dateStatsDatas.at(1)['Red K/D'], false)}`,
        inline: true
      },
      {
        name: 'Orange K/D',
        value: `**${dateStatsDatas.at(0)['Orange K/D']}** - \
        ${dateStatsDatas.at(1)['Orange K/D']} ${compareStats(dateStatsDatas.at(0)['Orange K/D'], dateStatsDatas.at(1)['Orange K/D'], false)}`,
        inline: true
      },
      {
        name: 'Green K/D',
        value: `**${dateStatsDatas.at(0)['Green K/D']}** - \
        ${dateStatsDatas.at(1)['Green K/D']} ${compareStats(dateStatsDatas.at(0)['Green K/D'], dateStatsDatas.at(1)['Green K/D'])}`,
        inline: true
      })
    .setImage('attachment://graph.png')

  const options = [{
    label: getTranslation('strings.compare', interaction.locale, {
      playerName1: firstUserDatas.playerDatas.nickname,
      playerName2: secondUserDatas.playerDatas.nickname
    }),
    value: JSON.stringify({
      p1: firstUserDatas.playerId,
      p2: secondUserDatas.playerId,
    }),
    default: true
  },
  {
    label: 'Datas',
    value: JSON.stringify({
      m: maxMatch,
      c: map
    })
  }]

  const playerColor = getRandomColors(2)

  const datasets = [firstUserDatas, secondUserDatas]
    .map((user, i) => [
      user.playerDatas.nickname,
      type,
      playerColor[i],
      Graph.getGraph(interaction, user.playerDatas.nickname, type, user.playerHistory, user.playerDatas.games.csgo.faceit_elo, maxMatch, true).reverse()
    ])

  const graphBuffer = Graph.getChart(
    datasets,
    new Array(Math.min(firstUserDatas.playerHistory.length, secondUserDatas.playerHistory.length)).fill(''),
    Graph.getCompareDatasets,
    false
  )

  return {
    embeds: [card],
    files: [
      new Discord.AttachmentBuilder(graphBuffer, { name: 'graph.png' }),
    ],
    components: [
      new Discord.ActionRowBuilder()
        .addComponents(new Discord.StringSelectMenuBuilder()
          .setCustomId('compareStatsSelector')
          .addOptions(options)
          .setDisabled(true)),
      new Discord.ActionRowBuilder()
        .addComponents([
          CustomTypeFunc.generateButtons(
            interaction,
            { ...buttonValues, n: 1 },
            CustomType.TYPES.KD,
            type === CustomType.TYPES.KD),
          CustomTypeFunc.generateButtons(
            interaction,
            { ...buttonValues, n: 2 },
            CustomType.TYPES.ELO,
            type === CustomType.TYPES.ELO)
        ])
    ]
  }
}

module.exports = {
  name: 'compare',
  options: [{
    name: 'match_number',
    description: getTranslation('options.matchNumber', 'en-US'),
    descriptionLocalizations: getTranslations('options.matchNumber'),
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
  getMapOption(),],
  description: getTranslation('command.compare.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.compare.description'),
  usage: '<match_number> {<first_user_steam> <first_user_faceit>} [<second_user_steam> <second_user_faceit>] <map>',
  example: 'match_number: 100 first_user_steam: justdams second_user_steam: sheraw map: Vertigo',
  type: 'stats',
  async execute(interaction) {
    const player1 = (await getUsers(interaction, 1, 'first_user_steam', 'first_user_faceit'))?.at(0)?.param
    const player2 = (await getUsers(interaction, 1, 'second_user_steam', 'second_user_faceit'))?.at(0)?.param

    if (!player1 || !player2) return errorCard('error.user.missing', interaction.locale)
    else if (player1 === player2) return errorCard('error.user.compareSame', interaction.locale)

    return sendCardWithInfo(interaction, player1, player2)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
