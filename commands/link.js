const { color } = require('../config.json')
const Discord = require('discord.js')
const Player = require('../functions/player')
const Steam = require('../functions/steam')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (message, steamParam) => {
  try {
    const steamId = await Steam.getId(steamParam)
    const playerId = await Player.getId(steamId)
    const playerDatas = await Player.getDatas(playerId)
    const discordId = message.author.id

    await User.exists(discordId) ? User.update(discordId, steamId) : User.create(discordId, steamId)

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
      name: 'steam_parameter',
      description: 'steamID / steam custom ID / url of one steam profile / CSGO status.',
      required: true,
      type: 3,
    },
    {
      name: 'user_mention',
      description: '@user that has linked his profile to the bot.',
      required: false,
      type: 6,
    },
    {
      name: 'parameter',
      slashDescription: 'steamID / steam custom ID / url of one steam profile / @user / CSGO status.',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: 'Link a steam profile to the discord user, to get your stats directly (no parameters needed).',
  usage: 'steam parameter or @user, max 1 user',
  type: 'utility',
  async execute(message, args) {
    if (args?.length > 0) return getCardsConditions(message, args, sendCardWithInfos, 1)
    else return errorCard('A parameter is missing, do `.ffhelp link` to see how the command works.')
  }
}