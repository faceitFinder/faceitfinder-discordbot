const Discord = require('discord.js')
const { color, emojis } = require('../config.json')
const { getUsers, getInteractionOption } = require('../functions/commands')
const Player = require('../functions/player')
const DateStats = require('../functions/dateStats')
const CustomTypeFunc = require('../functions/customType')
const CustomType = require('../templates/customType')
const Graph = require('../functions/graph')
const errorCard = require('../templates/errorCard')

const compareStats = (stats1, stats2, positive = true) => {
  if (positive) {
    if (stats1 > stats2) return emojis.better.balise
    else if (stats1 < stats2) return emojis.worse.balise
  } else
    if (stats1 > stats2) return emojis.worse.balise
    else if (stats1 < stats2) return emojis.better.balise

  return emojis.even.balise
}

const getPlayerDatas = async (playerId, maxMatch) => {
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)
  const playerHistory = await DateStats.getPlayerHistory(playerId, maxMatch)

  return {
    playerId,
    playerDatas,
    playerStats,
    playerHistory
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

const sendCardWithInfos = async (interaction, player1Id, player2Id, type = CustomType.TYPES.ELO, maxMatch = 20) => {
  maxMatch = getInteractionOption(interaction, 'match_number') || maxMatch
  const firstUserDatas = await getPlayerDatas(player1Id, maxMatch)
  const secondUserDatas = await getPlayerDatas(player2Id, maxMatch)
  const playerWithLessMatch = [firstUserDatas, secondUserDatas]
    .sort((a, b) => a.playerHistory.length - b.playerHistory.length)[0]
  maxMatch = playerWithLessMatch.playerHistory.length
  const buttonValues = {
    id: 'uCSG',
    u: interaction.user.id
  }

  const dateStatsDatas = [firstUserDatas, secondUserDatas]
    .map(userDatas => DateStats.generatePlayerStats(userDatas.playerHistory))

  const card = new Discord.MessageEmbed()
    .setAuthor({
      name: firstUserDatas.playerDatas.nickname,
      iconURL: firstUserDatas.playerDatas.avatar
    })
    .setDescription(`Comparison between [${firstUserDatas.playerDatas.nickname}](https://www.faceit.com/fr/players/${firstUserDatas.playerDatas.nickname}) and [${secondUserDatas.playerDatas.nickname}](https://www.faceit.com/fr/players/${secondUserDatas.playerDatas.nickname})`)
    .setColor(color.primary)
    .addFields({
      name: 'Matchs Compared',
      value: maxMatch.toString(),
      inline: true
    },
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
        ${secondUserDatas.playerDatas.games.csgo.faceit_elo} ${compareStats(firstUserDatas.playerDatas.games.csgo.faceit_elo,
          secondUserDatas.playerDatas.games.csgo.faceit_elo)}`,
        inline: true
      },
      {
        name: 'Average MVPs',
        value: `**${dateStatsDatas.at(0)['Average MVPs']}** - \
        ${dateStatsDatas.at(1)['Average MVPs']} ${compareStats(dateStatsDatas.at(0)['Average MVPs'],
          dateStatsDatas.at(1)['Average MVPs'])}`,
        inline: true
      },
      {
        name: 'Average K/D',
        value: `**${dateStatsDatas.at(0)['Average K/D']}** - \
        ${dateStatsDatas.at(1)['Average K/D']} ${compareStats(dateStatsDatas.at(0)['Average K/D'],
          dateStatsDatas.at(1)['Average K/D'])}`,
        inline: true
      },
      {
        name: 'Average K/R',
        value: `**${dateStatsDatas.at(0)['Average K/R']}** - \
        ${dateStatsDatas.at(1)['Average K/R']} ${compareStats(dateStatsDatas.at(0)['Average K/R'],
          dateStatsDatas.at(1)['Average K/R'])}`,
        inline: true
      },
      {
        name: 'Average HS',
        value: `**${dateStatsDatas.at(0)['Average HS']}%** - \
        ${dateStatsDatas.at(1)['Average HS']}% ${compareStats(dateStatsDatas.at(0)['Average HS'],
          dateStatsDatas.at(1)['Average HS'])}`,
        inline: true
      },
      {
        name: 'Average Kills',
        value: `**${dateStatsDatas.at(0)['Average Kills']}** - \
        ${dateStatsDatas.at(1)['Average Kills']} ${compareStats(dateStatsDatas.at(0)['Average Kills'],
          dateStatsDatas.at(1)['Average Kills'])}`,
        inline: true
      },
      {
        name: 'Average Deaths',
        value: `**${dateStatsDatas.at(0)['Average Deaths']}** - \
        ${dateStatsDatas.at(1)['Average Deaths']} ${compareStats(dateStatsDatas.at(0)['Average Deaths'],
          dateStatsDatas.at(1)['Average Deaths'], false)}`,
        inline: true
      },
      {
        name: 'Average Assists',
        value: `**${dateStatsDatas.at(0)['Average Assists']}** - \
        ${dateStatsDatas.at(1)['Average Assists']} ${compareStats(dateStatsDatas.at(0)['Average Assists'],
          dateStatsDatas.at(1)['Average Assists'])}`,
        inline: true
      },
      {
        name: 'Red K/D',
        value: `**${dateStatsDatas.at(0)['Red K/D']}** - \
        ${dateStatsDatas.at(1)['Red K/D']} ${compareStats(dateStatsDatas.at(0)['Red K/D'],
          dateStatsDatas.at(1)['Red K/D'], false)}`,
        inline: true
      },
      {
        name: 'Orange K/D',
        value: `**${dateStatsDatas.at(0)['Orange K/D']}** - \
        ${dateStatsDatas.at(1)['Orange K/D']} ${compareStats(dateStatsDatas.at(0)['Orange K/D'],
          dateStatsDatas.at(1)['Orange K/D'], false)}`,
        inline: true
      },
      {
        name: 'Green K/D',
        value: `**${dateStatsDatas.at(0)['Green K/D']}** - \
        ${dateStatsDatas.at(1)['Green K/D']} ${compareStats(dateStatsDatas.at(0)['Green K/D'],
          dateStatsDatas.at(1)['Green K/D'])}`,
        inline: true
      })
    .setImage('attachment://graph.png')

  const option = {
    label: `Compare ${firstUserDatas.playerDatas.nickname} and ${secondUserDatas.playerDatas.nickname}`,
    value: JSON.stringify({
      p1: firstUserDatas.playerId,
      p2: secondUserDatas.playerId,
      m: maxMatch
    }),
    default: true
  }

  const playerColor = getRandomColors(2)

  const datasets = [firstUserDatas, secondUserDatas]
    .map((user, i) => [
      user.playerDatas.nickname,
      type,
      playerColor[i],
      Graph.getGraph(type, user.playerHistory, user.playerDatas.games.csgo.faceit_elo, maxMatch, true).reverse()
    ])

  const graphBuffer = Graph.getChart(
    datasets,
    new Array(firstUserDatas.playerHistory.length).fill(''),
    Graph.getCompareDatasets,
    false
  )

  return {
    embeds: [card],
    files: [
      new Discord.MessageAttachment(graphBuffer, 'graph.png'),
    ],
    components: [
      new Discord.MessageActionRow()
        .addComponents(new Discord.MessageSelectMenu()
          .setCustomId('compareStatsSelector')
          .addOptions([option])
          .setDisabled(true)),
      new Discord.MessageActionRow()
        .addComponents([
          CustomTypeFunc.generateButtons(
            { ...buttonValues, n: 1 },
            CustomType.TYPES.KD,
            type === CustomType.TYPES.KD),
          CustomTypeFunc.generateButtons(
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
    description: 'Number of matchs to display. Default: 20',
    required: false,
    type: 4,
    slash: true,
  },
  {
    name: 'first_user_steam',
    description: 'steam parameter / @user / empty to match your linked account',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'first_user_faceit',
    description: 'faceit nickname / @user / empty to match your linked account',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'second_user_steam',
    description: 'steam parameter / @user / empty to match your linked account',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'second_user_faceit',
    description: 'faceit nickname / @user / empty to match your linked account',
    required: false,
    type: 3,
    slash: true
  },],
  description: 'Compare both user stats.',
  usage: 'match_number: number, default 20 AND first_user_steam:steam parameter OR first_user_faceit:faceit nickname OR @user AND second_user_steam:steam parameter OR second_user_faceit:faceit nickname OR @user',
  type: 'stats',
  async execute(interaction) {
    const player1 = (await getUsers(interaction, 1, 'first_user_steam', 'first_user_faceit'))?.at(0)?.param
    const player2 = (await getUsers(interaction, 1, 'second_user_steam', 'second_user_faceit'))?.at(0)?.param

    if (!player1 || !player2) return errorCard('There is a user missing.')
    else if (player1 === player2) return errorCard('Both users are the same !')

    return sendCardWithInfos(interaction, player1, player2)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
