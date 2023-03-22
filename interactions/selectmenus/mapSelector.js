const { color } = require('../../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const Graph = require('../../functions/graph')
const DateStats = require('../../functions/dateStats')
const loadingCard = require('../../templates/loadingCard')
const errorCard = require('../../templates/errorCard')

const sendCardWithInfo = async (playerId, map, mode) => {
  if (!map) return
  const playerDatas = await Player.getDatas(playerId)
  const playerStats = await Player.getStats(playerId)
  const steamDatas = await Steam.getDatas(playerDatas.steam_id_64).catch(err => err.statusText)

  const faceitLevel = playerDatas.games.csgo.skill_level
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const maxMatch = playerStats.lifetime.Matches
  const size = 40
  const filesAtt = []

  let playerHistory = await DateStats.getPlayerHistory(playerId, maxMatch)
  playerHistory = playerHistory.filter(e => e.i1.indexOf(map) !== -1 && e.gameMode === mode)
  const elo = Graph.getEloGain(interaction, playerDatas.nickname, maxMatch, playerHistory, faceitElo, true).filter(e => e).reduce((a, b) => a + b, 0)

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)
  filesAtt.push(new Discord.AttachmentBuilder(rankImageCanvas, { name: 'level.png' }))

  const mapThumbnail = `./images/maps/${map}.jpg`
  const playerMapStats = playerStats.segments.filter(e => e.label === map && e.mode == mode)

  if (playerMapStats.length === 0) return errorCard(`**${playerDatas.nickname}** has not played this map.`, interaction.locale)

  const cards = playerMapStats.map(m => {
    if (fs.existsSync(mapThumbnail)) filesAtt.push(new Discord.AttachmentBuilder(mapThumbnail, { name: `${map}.jpg` }))

    return new Discord.EmbedBuilder()
      .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar || null, url: `https://www.faceit.com/en/players/${playerDatas.nickname}` })
      .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
      .setThumbnail('attachment://level.png')
      .addFields({ name: 'Map', value: map, inline: true },
        { name: 'Mode', value: mode, inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: 'Games', value: m.stats.Matches.toString(), inline: true },
        { name: 'Winrate', value: `${m.stats['Win Rate %']}%`, inline: true },
        { name: 'Elo', value: isNaN(elo) ? '0' : elo > 0 ? `+${elo}` : elo.toString(), inline: true },
        { name: 'Average K/D', value: m.stats['Average K/D Ratio'], inline: true },
        { name: 'Average HS', value: `${m.stats['Average Headshots %']}%`, inline: true },
        { name: 'Average MVPs', value: m.stats['Average MVPs'], inline: true },
        { name: 'Average Kills', value: m.stats['Average Kills'], inline: true },
        { name: 'Average Deaths', value: m.stats['Average Deaths'], inline: true },
        { name: 'Average Assists', value: m.stats['Average Assists'], inline: true })
      .setColor(color.levels[faceitLevel].color)
      .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })
      .setImage(`attachment://${map}.jpg`)
  })

  return {
    embeds: cards,
    files: filesAtt
  }
}

module.exports = {
  name: 'mapSelector',
  async execute(interaction) {
    const values = JSON.parse(interaction.values)
    if (values.u !== interaction.user.id) return
    [values.m, values.v] = values.l.split(' ')

    const options = interaction.message.components.at(0).components
      .filter(e => e instanceof Discord.StringSelectMenuComponent)
      .map(msm => {
        return msm.options.map(o => {
          const active = o.value === interaction.values.at(0)
          o.default = active
          return o
        })
      }).at(0)

    const components = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('mapSelector')
          .addOptions(options))

    loadingCard(interaction)

    return {
      ...await sendCardWithInfo(values.s, values.m, values.v),
      content: null,
      components: [components]
    }
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo