const { color } = require('../../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const fs = require('fs')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const Graph = require('../../functions/graph')
const errorCard = require('../../templates/errorCard')

module.exports = {
  name: 'mapSelector',
  async execute(interaction) {
    const values = JSON.parse(interaction.values)
    if (values.userId === interaction.user.id)
      try {
        const steamDatas = await Steam.getDatas(values.steamId)
        const playerId = await Player.getId(values.steamId)
        const playerStats = await Player.getStats(playerId)
        const playerDatas = await Player.getDatas(playerId)

        const faceitLevel = playerDatas.games.csgo.skill_level
        const size = 40
        const filesAtt = []

        const rankImageCanvas = Canvas.createCanvas(size, size)
        const ctx = rankImageCanvas.getContext('2d')
        ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)
        filesAtt.push(new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png'))

        const mapThumbnail = `./images/maps/${values.map}.jpg`
        const mapStats = playerStats.segments.filter(e => e.label === values.map && e.mode == values.mode)[0]

        const card = new Discord.MessageEmbed()
          .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
          .setTitle('Steam')
          .setURL(steamDatas.profileurl)
          .setThumbnail('attachment://level.png')
          .addFields({ name: 'Games', value: `${mapStats.stats.Matches} (${mapStats.stats['Win Rate %']}% Win)`, inline: true },
            { name: 'Map', value: values.map, inline: true },
            { name: 'Mode', value: values.mode, inline: true },
            { name: 'Average K/D', value: mapStats.stats['Average K/D Ratio'], inline: true },
            { name: 'Average HS', value: `${mapStats.stats['Average Headshots %']}%`, inline: true },
            { name: 'Average MVPs', value: mapStats.stats['Average MVPs'], inline: true },
            { name: 'Average Kills', value: mapStats.stats['Average Kills'], inline: true },
            { name: 'Average Deaths', value: mapStats.stats['Average Deaths'], inline: true },
            { name: 'Average Assists', value: mapStats.stats['Average Assists'], inline: true })
          .setColor(color.levels[faceitLevel].color)
          .setFooter(`Steam: ${steamDatas.personaname}`)

        if (fs.existsSync(mapThumbnail)) {
          filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${values.map}.jpg`),)
          card.setImage(`attachment://${values.map}.jpg`)
        }

        return {
          embeds: [card],
          files: filesAtt,
          components: [],
          content: null,
        }
      } catch (error) {
        console.log(error)
        interaction.editReply(errorCard(error.toString()))
      }
    else return false
  }
}