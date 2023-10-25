const { getDefaultInteractionOption, getOptionsValues } = require('../../functions/commands')
const CommandsStats = require('../../database/commandsStats')
const { loadingCard } = require('../../templates/loadingCard')

/**
 * Page date stats.
 */
module.exports = {
  name: 'pageDS',
  async execute(interaction, json) {
    const commandName = await interaction.message.fetchReference()
      .then((message) => message.interaction.commandName)
      .catch(() => interaction.message.interaction.commandName)
    CommandsStats.create(commandName, `button - ${json.t.name}`, interaction)

    loadingCard(interaction)

    return await require(`../../commands/${commandName}.js`)
      .sendCardWithInfo(interaction, {
        param: json.s,
        faceitId: true
      }, json.page, json.g)
  },
  getJSON(interaction, json) {
    const values = JSON.parse(getDefaultInteractionOption(interaction, 1).value)
    const interactionValues = getOptionsValues(interaction)

    return { ...json, ...values, ...interactionValues }
  }
}
