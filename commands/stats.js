const { color } = require('../config.json')
const Discord = require('discord.js')
const Graph = require('../functions/graph')
const CustomType = require('../templates/customType')
const { buildButtonsGraph } = require('../functions/customType')
const Options = require('../templates/options')
const { getCardsConditions, getGameOption } = require('../functions/commands')
const { getTranslation, getTranslations } = require('../languages/setup')
const { getStats, getLadder } = require('../functions/apiHandler')

const buildEmbed = async ({
  playerParam,
  game,
  type = CustomType.TYPES.ELO,
  locale
}) => {
  const maxMatch = 20
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
  const buttonValues = {
    id: 'uSG',
    playerId,
    game
  }

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
  const faceitLevel = playerDatas.games[game].skill_level
  const size = 40
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
      { name: 'Elo', value: playerLastStats['Current Elo'] ?? faceitElo.toString(), inline: true },
      { name: `:flag_${playerCountry.toLowerCase()}:`, value: ladderCountry.position.toString(), inline: true },
      { name: `:flag_${playerRegion.toLowerCase()}:`, value: ladderRegion.position.toString(), inline: true }
    )
    .setColor(color.levels[game][faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}`, iconURL: 'attachment://game.png' })


  const files = [
    new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` }),
    new Discord.AttachmentBuilder(`images/${game}.png`, { name: 'game.png' })
  ]

  if (playerHistory.length > 0) {
    const graphBuffer = Graph.generateChart(locale, playerDatas.nickname, playerHistory, maxMatch, type, game)
    files.push(new Discord.AttachmentBuilder(graphBuffer, { name: 'graph.png' }))
    card.setImage('attachment://graph.png')
  }

  return {
    card,
    files,
    buttonValues,
    historyLength: playerHistory.length
  }
}

const sendCardWithInfo = async (interaction, playerParam) => {
  const game = getGameOption(interaction)
  const {
    card,
    files,
    buttonValues,
    historyLength
  } = await buildEmbed({
    playerParam,
    game,
    locale: interaction.locale
  })

  let components = []

  if (historyLength) {
    components.push(new Discord.ActionRowBuilder().addComponents(await buildButtonsGraph(interaction, buttonValues)))
  }

  return {
    content: ' ',
    embeds: [card],
    files: files,
    components
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
    return getCardsConditions({
      interaction,
      fn: sendCardWithInfo
    })
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
module.exports.buildEmbed = buildEmbed
