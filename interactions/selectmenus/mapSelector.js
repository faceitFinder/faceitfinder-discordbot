const { emojis, color } = require('../../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const Graph = require('../../functions/graph')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'mapSelector',
  async execute(interaction) {
    const values = JSON.parse(interaction.values)
    if (values.u !== interaction.user.id) return
    [values.m, values.v] = values.l.split(' ')

    const options = interaction.message.components.at(0).components
      .filter(e => e instanceof Discord.MessageSelectMenu)
      .map(msm => {
        return msm.options.map(o => {
          const active = o.value === interaction.values.at(0)
          o.emoji = active ? emojis.select.balise : null
          o.default = active
          return o
        })
      }).at(0)

    const components = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId('mapSelector')
          .addOptions(options))

    loadingCard(interaction)

    const playerId = values.s
    const playerDatas = await Player.getDatas(playerId)
    const playerStats = await Player.getStats(playerId)
    const steamDatas = await Steam.getDatas(playerDatas.steam_id_64)

    const faceitLevel = playerDatas.games.csgo.skill_level
    const size = 40
    const filesAtt = []

    const rankImageCanvas = await Graph.getRankImage(faceitLevel, playerDatas.games.csgo.faceit_elo, size)
    filesAtt.push(new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png'))

    const mapThumbnail = `./images/maps/${values.m}.jpg`

    const cards = playerStats.segments.filter(e => e.label === values.m && e.mode == values.v).map(m => {
      if (fs.existsSync(mapThumbnail)) filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${values.m}.jpg`))

      return new Discord.MessageEmbed()
        .setAuthor({ name: playerDatas.nickname, iconURL: playerDatas.avatar, url: `https://www.faceit.com/fr/players/${playerDatas.nickname}` })
        .setDescription(`[Steam](${steamDatas.profileurl})`)
        .setThumbnail('attachment://level.png')
        .addFields({ name: 'Games', value: `${m.stats.Matches} (${m.stats['Win Rate %']}% Win)`, inline: true },
          { name: 'Map', value: values.m, inline: true },
          { name: 'Mode', value: values.v, inline: true },
          { name: 'Average K/D', value: m.stats['Average K/D Ratio'], inline: true },
          { name: 'Average HS', value: `${m.stats['Average Headshots %']}%`, inline: true },
          { name: 'Average MVPs', value: m.stats['Average MVPs'], inline: true },
          { name: 'Average Kills', value: m.stats['Average Kills'], inline: true },
          { name: 'Average Deaths', value: m.stats['Average Deaths'], inline: true },
          { name: 'Average Assists', value: m.stats['Average Assists'], inline: true })
        .setColor(color.levels[faceitLevel].color)
        .setFooter({ text: `Steam: ${steamDatas.personaname}` })
        .setImage(`attachment://${values.m}.jpg`)
    })

    return {
      embeds: cards,
      files: filesAtt,
      content: null,
      components: [components]
    }
  }
}