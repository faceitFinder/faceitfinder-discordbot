const { name, color } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const RegexFun = require('../functions/regex')
const User = require('../database/user')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const discordId = message.author.id

    await User.exists(discordId) ? await User.update(discordId, steamId) : await User.create(discordId, steamId)

    message.channel.send(new Discord.MessageEmbed()
      .setDescription(`Your account has been linked to ${playerDatas.nickname}`))

  } catch (error) {
    console.log(error)
    message.channel.send(new Discord.MessageEmbed()
      .setColor(color.error)
      .setDescription('**No players found**')
      .setFooter(`${name} Error`))
  }
}

module.exports = {
  name: 'link',
  aliasses: ['link', 'l'],
  options: ' [user steam id/ steam custom url id/ steam profile link/ csgo status ingame command with the users part]',
  description: "Link steam id to the discord user",
  type: 'command',
  async execute(message, args) {
    const steamId = RegexFun.findSteamUIds(message.content)
    const steamParam = args[0].split('/').filter(e => e).pop()

    if (steamId.length > 0) sendCardWithInfos(message, steamId)
    else sendCardWithInfos(message, steamParam)
  }
}