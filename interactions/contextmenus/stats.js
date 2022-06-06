const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Stats = require('../../commands/stats')

module.exports = {
  name: 'stats',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    return await Stats.sendCardWithInfos(interaction, user.faceitId)
  }
}