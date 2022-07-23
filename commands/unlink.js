const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const successCard = require('../templates/successCard')

const sendCardWithInfos = async (interaction) => {
  const discordId = interaction.user.id
  if (await User.exists(discordId)) {
    User.remove(discordId)

    return successCard('Your account has been unlinked.')
  }
  else return errorCard('Your account is not linked to a user.')
}

module.exports = {
  name: 'unlink',
  options: [],
  description: 'Unlink your steam id to the discord bot.',
  usage: '',
  type: 'utility',
  async execute(interaction) {
    return sendCardWithInfos(interaction)
  }
}