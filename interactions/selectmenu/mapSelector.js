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
    const mapStats = playerStats.segments.filter(e => e.label === values.m && e.mode == values.v)[0]

    const card = new Discord.MessageEmbed()
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setTitle('Steam')
      .setURL(steamDatas.profileurl)
      .setThumbnail('attachment://level.png')
      .addFields({ name: 'Games', value: `${mapStats.stats.Matches} (${mapStats.stats['Win Rate %']}% Win)`, inline: true },
        { name: 'Map', value: values.m, inline: true },
        { name: 'Mode', value: values.v, inline: true },
        { name: 'Average K/D', value: mapStats.stats['Average K/D Ratio'], inline: true },
        { name: 'Average HS', value: `${mapStats.stats['Average Headshots %']}%`, inline: true },
        { name: 'Average MVPs', value: mapStats.stats['Average MVPs'], inline: true },
        { name: 'Average Kills', value: mapStats.stats['Average Kills'], inline: true },
        { name: 'Average Deaths', value: mapStats.stats['Average Deaths'], inline: true },
        { name: 'Average Assists', value: mapStats.stats['Average Assists'], inline: true })
      .setColor(color.levels[faceitLevel].color)
      .setFooter(`Steam: ${steamDatas.personaname}`)

    if (fs.existsSync(mapThumbnail)) {
      filesAtt.push(new Discord.MessageAttachment(mapThumbnail, `${values.m}.jpg`))
      card.setImage(`attachment://${values.m}.jpg`)
    }

    await interaction.fetchReply().then(e => {
      e.removeAttachments()
      e.edit({
        embeds: [card],
        files: filesAtt,
        content: null
      })
    })
  }
}