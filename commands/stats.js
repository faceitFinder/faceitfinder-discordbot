const { color } = require('../config.json')
const Discord = require('discord.js')
const RegexFun = require('../functions/regex')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const Match = require('../functions/match')
const Ladder = require('../functions/ladder')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerStats = await Player.getStats(playerId)
    const playerHistory = await Match.getMatchElo(playerId, 20)
    const faceitElo = playerDatas.games.csgo.faceit_elo
    const graphCanvas = await Graph.generateCanvas(null, playerHistory, faceitElo)

    const playerCountry = playerDatas.country
    const playerRegion = playerDatas.games.csgo.region

    const ladderCountry = await Ladder.getDatas(playerId, playerRegion, playerCountry)
    const ladderRegion = await Ladder.getDatas(playerId, playerRegion)

    const faceitLevel = playerDatas.games.csgo.skill_level
    const size = 40

    const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)

    const card = new Discord.MessageEmbed()
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setTitle('Steam')
      .setURL(steamDatas.profileurl)
      .setThumbnail(`attachment://${faceitLevel}level.png`)
      .addFields({ name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
        { name: 'K/D', value: playerStats.lifetime['Average K/D Ratio'], inline: true },
        { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true },
        { name: 'Elo', value: faceitElo.toString(), inline: true },
        { name: `:flag_${playerCountry}:`, value: ladderCountry.position.toString(), inline: true },
        { name: `:flag_${playerRegion.toLowerCase()}:`, value: ladderRegion.position.toString(), inline: true })
      .setImage(`attachment://${steamId}graph.png`)
      .setColor(color.levels[faceitLevel].color)
      .setFooter(`Steam: ${steamDatas.personaname}`)

    return {
      embeds: [card],
      files: [
        new Discord.MessageAttachment(graphCanvas.toBuffer(), `${steamId}graph.png`),
        new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}level.png`)
      ]
    }
  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'stats',
  aliasses: ['stats', 's'],
  options: [
    {
      name: 'steam_parameters',
      description: 'steamIDs / steam custom IDs / url of one or more steam profiles / CSGO status.',
      required: true,
      type: 3,
    },
    {
      name: 'user_mentions',
      description: '@users that has linked their profiles to the bot.',
      required: false,
      type: 6,
    },
    {
      name: 'parameters',
      slashDescription: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: "Displays general stats. With elo graph of the 20 last games.",
  usage: 'multiple steam params and @user or CSGO status, max 10 users',
  type: 'stats',
  async execute(message, args) {
    return await getCardsConditions(message, args, sendCardWithInfos)
  }
}