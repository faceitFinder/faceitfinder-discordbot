const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../../commands/last')
const { getCardByUserType } = require('../../templates/loadingCard')
const Interaction = require('../../database/interaction')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('last', `button - ${json.type.name}`, interaction)

    getCardByUserType(newUser, interaction)

    if (!newUser) {
      interaction.message.components.at(0).components.at(0).options.forEach((option) => {
        Interaction.deleteOne(option.data.value)
      })
      interaction.message.components.at(1).components.forEach((component) => {
        Interaction.deleteOne(component.data.custom_id)
      })
    }

    return sendCardWithInfo(
      interaction,
      { param: json.playerId, faceitId: true },
      null,
      json.targetPage,
      json.map,
      'lastSelector',
      'pageLast',
      json.maxMatch,
      json.game
    )
  }
}

