const Player = require('../functions/player')
const Steam = require('../functions/steam')
const User = require('../database/user')
const { getCardsConditions } = require('../functions/commands')
const successCard = require('../templates/successCard')

const sendCardWithInfos = async (interaction, steamParam) => {
  const steamId = await Steam.getId(steamParam)
  const playerId = await Player.getId(steamId)
  const playerDatas = await Player.getDatas(playerId)
  const discordId = interaction.user.id

  await User.exists(discordId) ? User.update(discordId, steamId) : User.create(discordId, steamId)

  return successCard(`Your account has been linked to ${playerDatas.nickname}`)
}

module.exports = {
  name: 'link',
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
      required: true,
      type: 3,
      slash: true
    }
  ],
  description: 'Link a steam profile to the discord user, to get your stats directly (no parameters needed).',
  usage: 'steam parameter or @user, max 1 user',
  type: 'utility',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos, 1, 'parameter')
  }
}