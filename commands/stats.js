const { color } = require('../config.json')
const Discord = require('discord.js')
const Graph = require('../functions/graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const Options = require('../templates/options')
const { getCardsConditions, getGameOption } = require('../functions/commands')
const { getTranslation, getTranslations } = require('../languages/setup')
const { getStats, getLadder } = require('../functions/apiHandler')

const sendCardWithInfo = async (interaction, playerParam, type = CustomType.TYPES.ELO, game = null) => {
  const maxMatch = 20
  game ??= getGameOption(interaction)

  const {
    playerDatas,
    steamDatas,
    playerStats,
    playerHistory,
    playerLastStats
  } = await getStats({
    playerParam,
    matchNumber: maxMatch,
    checkElo: 1,
    game
  })

  const playerId = playerDatas.player_id
  const playerCountry = playerDatas.country
  const playerRegion = playerDatas.games[game].region
  const ladderCountry = await getLadder({
    playerParam,
    region: playerRegion,
    country: playerCountry,
    game
  })
  const ladderRegion = await getLadder({
    playerParam,
    region: playerRegion,
    game
  })
  const faceitElo = playerDatas.games[game].faceit_elo
  const buttonValues = {
    id: 'uSG',
    s: playerId,
    u: interaction.user.id,
    g: game
  }

  const graphBuffer = Graph.generateChart(interaction, playerDatas.nickname, playerHistory, maxMatch, type, game)

  const faceitLevel = playerDatas.games[game].skill_level
  const size = 40

  console.log(faceitLevel, faceitElo)

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size, game)

  const card = new Discord.EmbedBuilder()
    .setAuthor({
      name: playerDatas.nickname,
      iconURL: playerDatas.avatar || null,
      url: `https://www.faceit.com/en/players/${playerDatas.nickname}`
    })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games[game].game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(
      { name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
      { name: 'K/D', value: playerStats.lifetime['Average K/D Ratio'], inline: true },
      { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true },
      { name: 'Elo', value: playerLastStats['Current Elo'], inline: true },
      { name: `:flag_${playerCountry.toLowerCase()}:`, value: ladderCountry.position.toString(), inline: true },
      { name: `:flag_${playerRegion.toLowerCase()}:`, value: ladderRegion.position.toString(), inline: true }
    )
    .setImage('attachment://graph.png')
    .setColor(color.levels[game][faceitLevel].color)
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
            interaction,
            { ...buttonValues, n: 1 },
            CustomType.TYPES.KD,
            type === CustomType.TYPES.KD),
          CustomTypeFunc.generateButtons(
            interaction,
            { ...buttonValues, n: 2 },
            CustomType.TYPES.ELO,
            type === CustomType.TYPES.ELO),
          CustomTypeFunc.generateButtons(
            interaction,
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
  description: getTranslation('command.stats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.stats.description'),
  usage: Options.usage,
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
