const { color } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const RegexFun = require('../functions/regex')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const discordId = message.author.id

    await User.exists(discordId) ? await User.update(discordId, steamId) : User.create(discordId, steamId)

    return {
      embeds: [
        new Discord.MessageEmbed()
          .setColor(color.primary)
          .setDescription(`Your account has been linked to ${playerDatas.nickname}`)
      ]
    }

  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'link',
  aliasses: ['link'],
  options: [
    {
      name: 'user_steam_parameter',
      description: 'Steam id / custom steam id / url of a steam profile / csgo status users part',
      required: true,
      type: 3,
      slash: true
    }
  ],
  description: `Link steam id to the discord user, to get your stats directly (no parameters needed).`,
  usage: 'one of the options',
  type: 'utility',
  async execute(message, args) {
    const steamId = RegexFun.findSteamUIds(message.content)
    try {
      [args[0].split('/').filter(e => e).pop()]

      return await getCardsConditions([],
        steamId.length > 0 ? [steamId[0]] : [],
        [args[0].split('/').filter(e => e).pop()],
        message,
        sendCardWithInfos)
    } catch (e) {
      return errorCard(`A parameter is missing, do \`.ffhelp link\` to see how the command works.`)
    }
  }
}