const { color } = require('../../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Graph = require('../../functions/graph')
const DateStats = require('../../functions/dateStats')
const loadingCard = require('../../templates/loadingCard')
const errorCard = require('../../templates/errorCard')
const { getTranslation } = require('../../languages/setup')
const { getStats } = require('../../functions/apiHandler')
const { getOptionsValues } = require('../../functions/commands')

const sendCardWithInfo = async (interaction, playerId, map, mode, game) => {
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
  const playerMapStats = playerStats.segments.filter(e => e.label === map && e.mode == mode)

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
        { name: 'Winrate', value: `${playerLastStats.winrate.toFixed(2)}%`, inline: true },
        {
          name: 'Elo Gain',
          value: isNaN(playerLastStats.eloGain) ?
            '0'
            : playerLastStats.eloGain > 0 ?
              `+${playerLastStats.eloGain}`
              : playerLastStats.eloGain.toString(),
          inline: true
        },
        { name: 'K/D', value: playerLastStats.kd.toFixed(2), inline: true },
        { name: 'Kills', value: playerLastStats.kills.toString(), inline: true },
        { name: 'Deaths', value: playerLastStats.deaths.toString(), inline: true },
        { name: 'Average K/D', value: m.stats['Average K/D Ratio'], inline: true },
        { name: 'Average HS', value: `${m.stats['Average Headshots %']}%`, inline: true },
        { name: 'Average MVPs', value: m.stats['Average MVPs'], inline: true },
        { name: 'Average Kills', value: m.stats['Average Kills'], inline: true },
        { name: 'Average Deaths', value: m.stats['Average Deaths'], inline: true },
        { name: 'Average Assists', value: m.stats['Average Assists'], inline: true })
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

module.exports = {
  name: 'mapSelector',
  async execute(interaction, values) {
    [values.m, values.v] = values.l.split(' ')

    const options = interaction.message.components.at(1).components
      .filter(e => e instanceof Discord.StringSelectMenuComponent)
      .map(msm => msm.options.map(o => {
        const active = o.value === interaction.values.at(0)
        o.default = active

        DateStats.setOptionValues(o, values)

        return o
      })).at(0)

    const components = [
      values.dataRow,
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('mapSelector')
            .addOptions(options))
    ]

    loadingCard(interaction)

    return {
      ...await sendCardWithInfo(interaction, values.s, values.m, values.v, values.g),
      content: null,
      components: components
    }
  },
  sendCardWithInfo,
  getJSON(interaction, json) {
    const values = getOptionsValues(interaction)
    const dataRow = interaction.message.components.at(0)

    return Object.assign({}, JSON.parse(interaction.values), values, { dataRow })
  },
  updateUser(interaction) {
    const values = this.getJSON(interaction)
    const dataRowValues = JSON.parse(values.dataRow.components.at(0).options.at(0).value)
    dataRowValues.u = interaction.user.id
    values.dataRow.components.at(0).options.at(0).value = JSON.stringify(dataRowValues)

    return values
  }
}