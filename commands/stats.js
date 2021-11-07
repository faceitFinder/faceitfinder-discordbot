const { color } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
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
    const graphCanvas = await Graph.generateCanvas(null, playerHistory, playerDatas.games.csgo.faceit_elo)

    const playerCountry = playerDatas.country
    const playerRegion = playerDatas.games.csgo.region

    const ladderCountry = await Ladder.getDatas(playerId, playerRegion, playerCountry)
    const ladderRegion = await Ladder.getDatas(playerId, playerRegion)

    const faceitLevel = playerDatas.games.csgo.skill_level
    const size = 40

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

    const card = new Discord.MessageEmbed()
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setTitle('Steam')
      .setURL(steamDatas.profileurl)
      .setThumbnail(`attachment://${faceitLevel}level.png`)
      .addFields({ name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
        { name: 'K/D', value: playerStats.lifetime['Average K/D Ratio'], inline: true },
        { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true },
        { name: 'Elo', value: playerDatas.games.csgo.faceit_elo.toString(), inline: true },
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
      name: 'user_steam_id',
      description: 'Steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'user_custom_steam_id',
      description: 'Custom steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'steam_profile_link',
      description: 'Url of a steam profile.',
      required: false,
      type: 3
    },
    {
      name: 'csgo_status',
      description: 'The result of the "status" command in CS:GO that contains the user part.',
      required: false,
      type: 3
    },
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6,
      slash: true
    }
  ],
  description: "Displays general stats of the user(s) given, including a graph that show the elo evolution.",
  slashDescription: "Displays general stats of the @ user, including a graph that show the elo evolution.",
  usage: 'one of the options',
  type: 'stats',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)
    const params = []
    await args.forEach(async e => { params.push(e.split('/').filter(e => e).pop()) })

    return await getCardsConditions(message.mentions.users, steamIds, params, message, sendCardWithInfos)
  }
}