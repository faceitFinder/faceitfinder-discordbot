const { color, prefix } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const RegexFun = require('../functions/regex')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const Ladder = require('../functions/ladder')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')

const sendCardWithInfos = async (steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const steamDatas = await Steam.getDatas(steamId)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const playerStats = await Player.getStats(playerId)
    const graphCanvas = await Graph.generateCanvas(playerId)

    const playerCountry = playerDatas.country
    const playerRegion = playerDatas.games.csgo.region

    const ladderCountry = await Ladder.getDatas(playerId, playerRegion, playerCountry)
    const ladderRegion = await Ladder.getDatas(playerId, playerRegion)

    const faceitLevel = playerDatas.games.csgo.skill_level_label
    const size = 40

    const rankImageCanvas = Canvas.createCanvas(size, size)
    const ctx = rankImageCanvas.getContext('2d')
    ctx.drawImage(await Graph.getRankImage(faceitLevel, size), 0, 0)

    const card = new Discord.MessageEmbed()
      .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
      .setTitle('Steam')
      .setURL(steamDatas.profileurl)
      .setThumbnail('attachment://level.png')
      .addFields({ name: 'Games', value: `${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)`, inline: true },
        { name: 'K/D', value: `${playerStats.lifetime['Average K/D Ratio']}`, inline: true },
        { name: 'HS', value: `${playerStats.lifetime['Average Headshots %']}%`, inline: true },
        { name: 'Elo', value: `${playerDatas.games.csgo.faceit_elo}`, inline: true },
        { name: `:flag_${playerCountry}:`, value: `${ladderCountry.position}`, inline: true },
        { name: `:flag_${playerRegion.toLowerCase()}:`, value: `${ladderRegion.position}`, inline: true })
      .setImage('attachment://graph.png')
      .setColor(color.levels[faceitLevel].color)
      .setFooter(`Steam: ${steamDatas.personaname}`)

    return {
      embeds: [card],
      files: [
        new Discord.MessageAttachment(graphCanvas.toBuffer(), 'graph.png'),
        new Discord.MessageAttachment(rankImageCanvas.toBuffer(), 'level.png')
      ]
    }
  } catch (error) {
    console.log(error)
    return errorCard('**No players found**')
  }
}

module.exports = {
  name: 'stats',
  aliasses: ['stats', 's'],
  options: [
    {
      name: 'user_steam_id',
      description: 'Steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'user_custom_steam_id',
      description: 'Custom steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'steam_profile_link',
      description: 'Url of a steam profile.',
      required: false,
      type: 3
    },
    {
      name: 'csgo_status',
      description: 'The result of the "status" command in CS:GO that contains the user part.',
      required: false,
      type: 3
    },
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6
    }
  ],
  description: "Displays general stats of the user(s) given, including a graph that show the elo evolution.",
  usage: 'one of the options',
  type: 'command',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)

    if (message.mentions.users.size > 0)
      message.mentions.users.forEach(async e => {
        const user = await User.exists(e.id)
        if (!user) message.channel.send(errorCard('**No players found**'))
        else message.channel.send(await sendCardWithInfos(user.steamId))
      })
    else if (steamIds.length > 0) steamIds.forEach(async e => { message.channel.send(await sendCardWithInfos(e)) })
    else if (args.length > 0)
      args.forEach(async e => {
        const steamParam = e.split('/').filter(e => e).pop()
        message.channel.send(await sendCardWithInfos(steamParam))
      })
    else if (await User.get(message.author.id)) message.channel.send(await sendCardWithInfos((await User.get(message.author.id)).steamId))
    else message.channel.send(errorCard(`You need to link your account to do that without a parameter, do ${prefix}help link to see how.`))
  }
}