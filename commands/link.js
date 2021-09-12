const { color, prefix } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const RegexFun = require('../functions/regex')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const { getCards } = require('../functions/commands')

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
    return errorCard('**No players found**')
  }
}

module.exports = {
  name: 'link',
  aliasses: ['link'],
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
    }
  ],
  description: `Link steam id to the discord user, to get your stats directly (no parameters needed).`,
  usage: 'one of the options',
  type: 'command',
  async execute(message, args) {
    const steamId = RegexFun.findSteamUIds(message.content)

    if (steamId.length > 0) return getCards(message, [steamId[0]], sendCardWithInfos)
    else if (args.length > 0) return getCards(message, [args[0].split('/').filter(e => e).pop()], sendCardWithInfos)
    else return errorCard(`A parameter is missing, please do ${prefix}help link, to see how to do.`)
  }
}