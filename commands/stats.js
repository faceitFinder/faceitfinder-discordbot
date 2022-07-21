const { color } = require('../config.json')
const Discord = require('discord.js')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const Match = require('../functions/match')
const Ladder = require('../functions/ladder')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const Options = require('../templates/options')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (interaction, playerId, type = CustomType.TYPES.ELO) => {
  const playerDatas = await Player.getDatas(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64).catch(err => err.statusText)
  const playerStats = await Player.getStats(playerId)
  const maxMatch = 20
  const playerHistory = await Match.getMatchElo(playerId, maxMatch)
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const buttonValues = {
    id: 'updateStatsGraph',
    s: playerId,
    u: interaction.user.id
  }

  const graphBuffer = Graph.generateChart(playerHistory, faceitElo, maxMatch, type)

  const playerCountry = playerDatas.country
  const playerRegion = playerDatas.games.csgo.region

  const ladderCountry = await Ladder.getDatas(playerId, playerRegion, playerCountry)
  const ladderRegion = await Ladder.getDatas(playerId, playerRegion)

  const faceitLevel = playerDatas.games.csgo.skill_level
  const size = 40

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)

  const card = new Discord.EmbedBuilder()
    .setAuthor({
      name: playerDatas.nickname,
      iconURL: playerDatas.avatar,
      url: `https://www.faceit.com/fr/players/${playerDatas.nickname}`
    })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/fr/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields({ name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
      { name: 'K/D', value: playerStats.lifetime['Average K/D Ratio'], inline: true },
      { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true },
      { name: 'Elo', value: faceitElo.toString(), inline: true },
      { name: `:flag_${playerCountry.toLowerCase()}:`, value: ladderCountry.position.toString(), inline: true },
      { name: `:flag_${playerRegion.toLowerCase()}:`, value: ladderRegion.position.toString(), inline: true })
    .setImage('attachment://graph.png')
    .setColor(color.levels[faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })

  return {
    content: ' ',
    embeds: [card],
    files: [
      new Discord.AttachmentBuilder(graphBuffer, { name: 'graph.png' }),
      new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` })
    ],
    components: [
      new Discord.ActionRowBuilder()
        .addComponents([
          CustomTypeFunc.generateButtons(
            { ...buttonValues, n: 1 },
            CustomType.TYPES.KD,
            type === CustomType.TYPES.KD),
          CustomTypeFunc.generateButtons(
            { ...buttonValues, n: 2 },
            CustomType.TYPES.ELO,
            type === CustomType.TYPES.ELO),
          CustomTypeFunc.generateButtons(
            { ...buttonValues, n: 3 },
            CustomType.TYPES.ELO_KD,
            type === CustomType.TYPES.ELO_KD)
        ])
    ]
  }
}

module.exports = {
  name: 'stats',
  options: Options.stats,
  description: 'Displays general stats. With elo graph of the 20 last games.',
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos)
  }
}

module.exports.sendCardWithInfos = sendCardWithInfos
