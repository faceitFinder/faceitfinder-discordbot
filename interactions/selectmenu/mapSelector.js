const { color } = require('../../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const Graph = require('../../functions/graph')

module.exports = {
  name: 'mapSelector',
  async execute(interaction) {
    const values = JSON.parse(interaction.values)
    if (values.u !== interaction.user.id) return false

    const steamDatas = await Steam.getDatas(values.s)
    const playerId = await Player.getId(values.s)
    const playerStats = await Player.getStats(playerId)
    const playerDatas = await Player.getDatas(playerId)

    const faceitLevel = playerDatas.games.csgo.skill_level
    const size = 40
    const filesAtt = []

    const rankImageCanvas = await Graph.getRankImage(faceitLevel, playerDatas.games.csgo.faceit_elo, size)
    filesAtt.push(new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png'))

    const mapThumbnail = `./images/maps/${values.m}.jpg`

    const cards = playerStats.segments.filter(e => e.label === values.m && e.mode == values.v).map(m => {
      if (fs.existsSync(mapThumbnail)) filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${values.m}.jpg`))

      return new Discord.MessageEmbed()
        .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
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
        .setFooter(`Steam: ${steamDatas.personaname}`)
        .setImage(`attachment://${values.m}.jpg`)
    })

    return {
      embeds: cards,
      files: filesAtt,
      content: null
    }
  }
}