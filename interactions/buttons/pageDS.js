const CommandsStats = require('../../database/commandsStats')
const { getCardByUserType } = require('../../templates/loadingCard')
const Interaction = require('../../database/interaction')

/**
 * Page date stats.
 */
module.exports = {
  name: 'pageDS',
  async execute(interaction, json, newUser = false) {
    const commandName = await interaction.message.fetchReference()
      .then((message) => message.interaction.commandName)
      .catch(() => interaction.message.interaction.commandName)
    CommandsStats.create(commandName, `button - ${json.type.name}`, interaction)

    getCardByUserType(newUser, interaction)

    interaction.message.components.at(0).components.at(0).options.forEach((option) => {
      Interaction.deleteOne(option.data.value)
    })
    interaction.message.components.at(1).components.forEach((component) => {
      Interaction.deleteOne(component.data.custom_id)
    })
    interaction.message.components.at(2).components.forEach((component) => {
      Interaction.deleteOne(component.data.custom_id)
    })

    return await require(`../../commands/${commandName}.js`)
      .sendCardWithInfo(
        interaction,
        { param: json.playerId, faceitId: true },
        json.targetPage,
        json.game,
        json.chartType
      )
  }
}
