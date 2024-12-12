const { sendCardWithInfo } = require('../../commands/find')
const CommandsStats = require('../../database/commandsStats')
const { getCardByUserType } = require('../../templates/loadingCard')
const Interaction = require('../../database/interaction')

/**
 * Find user stats graph.
 */
module.exports = {
  name: 'fUSG',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('find', 'button - player', interaction)

    getCardByUserType(newUser, interaction)

    if (!newUser) {
      interaction.message.components.at(0).components.at(0).options.forEach((option) => {
        Interaction.deleteOne(option.data.value)
      })
      interaction.message.components.at(1).components.forEach((component) => {
        Interaction.deleteOne(component.data.custom_id)
      })
      interaction.message.components.at(2).components.forEach((component) => {
        Interaction.deleteOne(component.data.custom_id)
      })
    }

    return sendCardWithInfo(
      interaction,
      { param: json.playerIdTarget, faceitId: true },
      json.maxMatch,
      true,
      json.map,
      [],
      json.includedPlayers,
      [],
      json.excludedPlayers,
      json.game,
      0,
      null
    )
  }
}