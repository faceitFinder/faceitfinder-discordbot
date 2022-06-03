const Player = require('../functions/player')
const User = require('../database/user')
const { getCardsConditions } = require('../functions/commands')
const successCard = require('../templates/successCard')

const sendCardWithInfos = async (interaction, playerId) => {
  const playerDatas = await Player.getDatas(playerId)
  const discordId = interaction.user.id

  await User.exists(discordId) ? User.update(discordId, playerId) : User.create(discordId, playerId)

  return successCard(`Your account has been linked to ${playerDatas.nickname}`)
}

module.exports = {
  name: 'link',
  options: [
    {
      name: 'steam_parameter',
      description: 'steamID / steam custom ID / url of one steam profile / @user / CSGO status.',
      required: false,
      type: 3,
      slash: true
    },
    {
      name: 'faceit_parameters',
      description: 'faceit nickname (case sensitive)',
      required: false,
      type: 3,
      slash: true
    }
  ],
  description: 'Link a steam profile to the discord user, to get your stats directly (no parameters needed).',
  usage: 'steam_parameter:steam param or @user or CSGO status (max 1 user) OR faceit_parameters:faceit nickname (max 1)',
  type: 'utility',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfos, 1, 'steam_parameter')
  }
}