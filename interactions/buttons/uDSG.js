const CommandsStats = require('../../database/commandsStats')
const DateStats = require('../../functions/dateStats')
const { getCardByUserType } = require('../../templates/loadingCard')
const { updateButtons } = require('../../functions/customType')
const { updatePaginationComponents } = require('../../functions/pagination')

/**
 * Update date stats graph.
 */
module.exports = {
  name: 'uDSG',
  async execute(interaction, json, newUser = false) {
    const commandName = await interaction.message.fetchReference()
      .then((message) => message.interaction.commandName)
      .catch(() => interaction.message.interaction.commandName)
    CommandsStats.create(commandName, `button - ${json.type.name}`, interaction)

    let components = interaction.message.components

    getCardByUserType(newUser, interaction)

    if (newUser) {
      return await require(`../../commands/${commandName}.js`)
        .sendCardWithInfo(
          interaction,
          { param: json.playerId, faceitId: true },
          json.currentPage,
          json.game,
          json.type
        )
    }

    const resp = await DateStats.getCardWithInfo({
      interaction,
      values: json,
      type: json.type
    })

    components.at(0).components.at(0).options.forEach((option) => {
      DateStats.updateOptionsType(option.data.value, json.type)
    })
    components.at(0).components.at(0).data.disabled = false
    components.at(1).components = updateButtons(components.at(1).components, json.type)
    updatePaginationComponents(components.at(2).components, json, { chartType: json.type })

    resp.components = components

    return resp
  }
}
