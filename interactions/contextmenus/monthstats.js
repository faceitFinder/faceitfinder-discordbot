const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const Monthstats = require('../../commands/monthstats')

module.exports = {
  name: 'monthstats',
  type: 2,
  async execute(interaction) {
    const user = await User.exists(interaction.targetId)
    if (!user) return errorCard('This user has not linked his profile')
    return await Monthstats.sendCardWithInfos(interaction, user.faceitId)
  }
}