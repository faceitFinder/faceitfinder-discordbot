const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Weekstats = require('../../commands/weekstats')

module.exports = {
  name: 'weekstats',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    return await Weekstats.sendCardWithInfos(interaction, user.faceitId)
  }
}