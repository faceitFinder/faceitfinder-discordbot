const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Dailystats = require('../../commands/dailystats')

module.exports = {
  name: 'dailystats',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    return await Dailystats.sendCardWithInfos(interaction, user.faceitId)
  }
}