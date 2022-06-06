const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Last = require('../../commands/last')

module.exports = {
  name: 'last',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    return await Last.sendCardWithInfos(interaction, user.faceitId)
  }
}