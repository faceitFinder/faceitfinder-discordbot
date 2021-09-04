const { color, name } = require('../../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const fs = require('fs')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const Graph = require('../../functions/graph')

module.exports = {
  name: 'mapSelector',
  async execute(interaction) {
    try {
      const map = interaction.values[0].split(',')[0]
      const mode = interaction.values[0].split(',')[1]
      const steamId = interaction.values[0].split(',')[2]

      const steamDatas = await Steam.getDatas(steamId)
      const playerId = await Player.getId(steamId)
      const playerStats = await Player.getStats(playerId)
      const playerDatas = await Player.getDatas(playerId)

      const faceitLevel = playerDatas.games.csgo.skill_level_label
      const size = 40

      const rankImageCanvas = Canvas.createCanvas(size, size)
      const ctx = rankImageCanvas.getContext('2d')
      ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

      let mapThumbnail = `./images/maps/${map}.jpg`
      if (!fs.existsSync(mapThumbnail)) mapThumbnail = `./images/maps/unknown.png`

      const mapStats = playerStats.segments.filter(e => e.label === map && e.mode == mode)[0]

      const card = new Discord.MessageEmbed()
        .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
        .setTitle('Steam')
        .setURL(steamDatas.profileurl)
        .setThumbnail('attachment://level.png')
        .addFields({ name: 'Games', value: `${mapStats.stats.Matches} (${mapStats.stats['Win Rate %']}% Win)`, inline: true },
          { name: 'Average K/D', value: `${mapStats.stats['Average K/D Ratio']}`, inline: true },
          { name: 'Average HS', value: `${mapStats.stats['Average Headshots %']}%`, inline: true },
          { name: 'Average Kills', value: `${mapStats.stats['Average Kills']}`, inline: true },
          { name: 'Average Deaths', value: `${mapStats.stats['Average Deaths']}`, inline: true },
          { name: 'Average Assists', value: `${mapStats.stats['Average Assists']}`, inline: true },
          { name: 'Average MVPs', value: `${mapStats.stats['Average MVPs']}`, inline: true })
        .setImage('attachment://map.jpg')
        .setColor(color.levels[faceitLevel - 1])
        .setFooter(`Steam: ${steamDatas.personaname}`)

      interaction.reply({
        embeds: [card],
        files: [
          new Discord.MessageAttachment(mapThumbnail, 'map.jpg'),
          new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png')
        ]
      })
    } catch (error) {
      console.log(error)
      interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor(color.error)
            .setDescription(`**${error.toString()}**`)
            .setFooter(`${name} Error`)
        ]
      })
    }
  }
}