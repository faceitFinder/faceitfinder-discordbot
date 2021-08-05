const { color, name } = require('../config.json')
const Discord = require('discord.js')
const RegexFun = require('../functions/regex')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')

const sendEloGraph = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const graphBuffer = await Graph.generateCanva(playerId)

    message.channel.send({
      embeds: [new Discord.MessageEmbed()],
      files: [new Discord.MessageAttachment(graphBuffer)]
    })
  } catch (error) {
    console.log(error)
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(color.error)
        .setDescription('**No players found**')
        .setFooter(`${name} Error`)
    )
  }
}

module.exports = {
  name: 'elo',
  aliasses: ['elo'],
  options: ' [user steam id/ steam custom url id/ steam profile link/ csgo status ingame command with the users part]',
  description: 'Show a graph with the elo evolution of the user(s) given',
  type: 'stats',
  async execute(message, args) {
    const steamParam = args[0].split('/').filter(e => e).pop()
    const steamIds = RegexFun.findSteamId(message)

    if (steamIds.length > 0)
      steamIds.forEach(e => {
        sendEloGraph(message, e)
      })
    else
      sendEloGraph(message, steamParam)
  }
}