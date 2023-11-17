const CommandsStats = require('../../database/commandsStats')
const { getCardByUserType } = require('../../templates/loadingCard')
const Interaction = require('../../database/interaction')
const { sendCardWithInfo } = require('../../commands/find')

module.exports = {
  name: 'pageFind',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('find', `button - ${json.type.name}`, interaction)

    getCardByUserType(newUser, interaction)

    if (!newUser) {
      interaction.message.components.at(0).components.at(0).options.forEach((option) => {
        Interaction.deleteOne(option.data.value)
      })
      interaction.message.components.at(1).components.forEach((button) => {
        Interaction.deleteOne(button.data.custom_id)
      })
      interaction.message.components.at(2).components.forEach((button) => {
        Interaction.deleteOne(button.data.custom_id)
      })
    }

    return sendCardWithInfo(
      interaction,
      { param: json.playerId, faceitId: true },
      json.maxMatch,
      true,
      json.map,
      [],
      json.includedPlayers,
      [],
      json.excludedPlayers,
      json.game,
      json.targetPage,
      null
    )
  }
}
