const { color } = require('../config.json')
const Discord = require('discord.js')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const Match = require('../functions/match')
const Ladder = require('../functions/ladder')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (interaction, steamParam, type = CustomType.TYPES.ELO) => {
  const steamId = await Steam.getId(steamParam)
  const steamDatas = await Steam.getDatas(steamId)
  const playerId = await Player.getId(steamId)
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)
  const playerHistory = await Match.getMatchElo(playerId, 20)
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const buttonValues = {
    id: 'updateStatsGraph',
    s: steamId,
    u: interaction.user.id
  }

  const graphCanvas = Graph.generateCanvas(CustomTypeFunc.getGraph(type, playerHistory, faceitElo),
    null, null, 20, type)

  const playerCountry = playerDatas.country
  const playerRegion = playerDatas.games.csgo.region

  const ladderCountry = await Ladder.getDatas(playerId, playerRegion, playerCountry)
  const ladderRegion = await Ladder.getDatas(playerId, playerRegion)


  const faceitLevel = playerDatas.games.csgo.skill_level
  const size = 40

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)

  const card = new Discord.MessageEmbed()
    .setAuthor({
      name: playerDatas.nickname,
      iconURL: playerDatas.avatar,
      url: `https://www.faceit.com/fr/players/${playerDatas.nickname}`
    })
    .setTitle('Steam')
    .setURL(steamDatas.profileurl)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields({ name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
      { name: 'K/D', value: playerStats.lifetime['Average K/D Ratio'], inline: true },
      { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true },
      { name: 'Elo', value: faceitElo.toString(), inline: true },
      { name: `:flag_${playerCountry.toLowerCase()}:`, value: ladderCountry.position.toString(), inline: true },
      { name: `:flag_${playerRegion.toLowerCase()}:`, value: ladderRegion.position.toString(), inline: true })
    .setImage('attachment://graph.png')
    .setColor(color.levels[faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas.personaname}` })

  return {
    content: ' ',
    embeds: [card],
    files: [
      new Discord.MessageAttachment(graphCanvas.toBuffer(), 'graph.png'),
      new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}level.png`)
    ],
    components: [
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
  name: 'stats',
  options: [
    {
      name: 'steam_parameters',
      description: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'team',
      description: 'team slug (you need to be a part of it, the creator, or it has to be public)',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'faceit_parameters',
      description: 'faceit nicknames (case sensitive)',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: 'Displays general stats. With elo graph of the 20 last games.',
  usage: 'steam_parameters:multiple steam params and @user or CSGO status (max 10 users) OR team:team slug (max 1) OR faceit_parameters:faceit nickname (max 1)',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
