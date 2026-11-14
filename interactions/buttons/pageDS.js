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

    if (!newUser) {
      // A page without match only has the pagination row: every row is optional
      interaction.message.components.forEach((row) => {
        row.components.forEach((component) => {
          component.options?.forEach((option) => Interaction.deleteOne(option.value ?? option.data?.value))
          if (component.data.custom_id) Interaction.deleteOne(component.data.custom_id)
        })
      })
    }

    return await require(`../../commands/${commandName}.js`)
      .sendCardWithInfo(
        interaction,
        { param: json.playerId, faceitId: true },
        json.targetPage,
        json.game,
        json.chartTypen,
        0,
        json.map
      )
  }
}
