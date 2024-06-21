const { emojis, itemByPage, color, maps } = require('../config.json')
const fs = require('fs')
const Discord = require('discord.js')
const Options = require('../templates/options')
const Graph = require('../functions/graph')
const Interaction = require('../database/interaction')
const { getCardsConditions } = require('../functions/commands')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')
const errorCard = require('../templates/errorCard')
const { getInteractionOption, getGameOption } = require('../functions/utility')

const buildEmbed = async (interaction, playerId, map, mode, game) => {
  if (!map) return

  const {
    playerDatas,
    playerStats,
    steamDatas,
    playerLastStats,
  } = await getStats({
    playerParam: {
      param: playerId,
      faceitId: true,
    },
    matchNumber: 0,
    checkElo: true,
    map,
    game
  })

  const faceitLevel = playerDatas.games[game].skill_level
  const faceitElo = playerDatas.games[game].faceit_elo
  const size = 40
  const filesAtt = []

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size, game)
  filesAtt.push(new Discord.AttachmentBuilder(rankImageCanvas, { name: 'level.png' }))

  const mapThumbnail = `./images/maps/${map}.jpg`
  const playerMapStats = playerStats.segments.filter(e => (e.label === maps[map] || e.label === map) && e.mode == mode)

  if (playerMapStats.length === 0) return errorCard(getTranslation('error.user.mapNotPlayed', interaction.locale, {
    playerName: playerDatas.nickname,
  }), interaction.locale)

  const cards = playerMapStats.map(m => {
    if (fs.existsSync(mapThumbnail)) filesAtt.push(new Discord.AttachmentBuilder(mapThumbnail, { name: `${map}.jpg` }))

    return new Discord.EmbedBuilder()
      .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
      .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games[game].game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
      .setThumbnail('attachment://level.png')
      .addFields({ name: 'Map', value: map, inline: true },
        { name: 'Mode', value: mode, inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: 'Games', value: m.stats.Matches.toString(), inline: true },
        { name: 'Winrate', value: `${parseFloat(m.stats['Win Rate %']).toFixed(2)}%`, inline: true },
        {
          name: 'Elo Gain',
          value: isNaN(playerLastStats.eloGain) ?
            '0'
            : playerLastStats.eloGain > 0 ?
              `+${playerLastStats.eloGain}`
              : playerLastStats.eloGain.toString(),
          inline: true
        },
        { name: 'K/D', value: (parseFloat(m.stats['Kills']) / parseFloat(m.stats['Deaths']))?.toFixed(2), inline: true },
        { name: 'Kills', value: m.stats['Kills'], inline: true },
        { name: 'Deaths', value: m.stats['Deaths'], inline: true },
        { name: 'Avg K/D', value: m.stats['Average K/D Ratio'], inline: true },
        { name: 'Avg K/R', value: m.stats['Average K/R Ratio'], inline: true },
        { name: 'Avg HS', value: `${m.stats['Average Headshots %']}%`, inline: true },
        { name: 'Avg Kills', value: m.stats['Average Kills'], inline: true },
        { name: 'Avg Deaths', value: m.stats['Average Deaths'], inline: true },
        { name: 'Avg Assists', value: m.stats['Average Assists'], inline: true })
      .setColor(color.levels[game][faceitLevel].color)
      .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}`, iconURL: 'attachment://game.png' })
      .setImage(`attachment://${map}.jpg`)
  })

  filesAtt.push(new Discord.AttachmentBuilder(`images/${game}.png`, { name: 'game.png' }))

  return {
    embeds: cards,
    files: filesAtt
  }
}

const sendCardWithInfo = async (interaction, playerParam, map = null, mode = null, game = null) => {
  map ??= getInteractionOption(interaction, 'map')
  game ??= getGameOption(interaction)
  mode ??= '5v5'
  let embeds = []
  let files = []

  const {
    playerDatas,
    playerStats,
  } = await getStats({
    playerParam,
    matchNumber: 1,
    game
  })

  if (!playerStats.segments.length) throw getTranslation('error.user.noMatches', interaction.locale, { playerName: playerDatas.nickname })

  const playerId = playerDatas.player_id
  let content = getTranslation('strings.selectMapDescription', interaction.locale, { playerName: playerDatas.nickname })

  let options = []
  await Promise.all(playerStats.segments.map(async (e) => {
    e.label = game === 'cs2' ? maps[e.label] : e.label
    const label = `${e.label} ${e.mode}`
    const values = {
      playerId,
      userId: interaction.user.id,
      game,
      map: e.label,
      mode: e.mode
    }

    if (!options.filter(e => e.data.label === label).length > 0) {
      const customId = (await Interaction.create(values)).id
      const option = new Discord.StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setDescription(
          getTranslation(
            'strings.matchPlayed',
            interaction.locale, { matchNumber: `${e.stats.Matches} (${e.stats['Win Rate %']}%)` }
          )
        )
        .setValue(customId)
        .setDefault(`${map} 5v5` === label)

      const emoji = emojis.maps[e.label]
      if (emoji) option.setEmoji(emoji.balise)

      options.push(option)
    }
  }))
  options = options.slice(0, itemByPage)

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('mapSelector')
          .setPlaceholder(getTranslation('strings.selectMap', interaction.locale))
          .addOptions(options))
  ]

  if (map) {
    const resp = await buildEmbed(interaction, playerId, map, mode, game)
    embeds = resp.embeds
    files = resp.files
    content = ''
  }

  return {
    content,
    embeds,
    files,
    components
  }
}

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.push(getMapOption())

  return options
}

module.exports = {
  name: 'map',
  options: getOptions(),
  description: getTranslation('command.map.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.map.description'),
  usage: `${Options.usage} <map>`,
  example: 'steam_parameters: justdams map: Vertigo',
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