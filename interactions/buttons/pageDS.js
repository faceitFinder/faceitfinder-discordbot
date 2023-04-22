const { getDefaultInteractionOption } = require('../../functions/commands')
const CommandsStats = require('../../database/commandsStats')
const { getTypePage } = require('../../functions/commandStats')
const loadingCard = require('../../templates/loadingCard')

/**
 * Page date stats.
 */
module.exports = {
  name: 'pageDS',
  async execute(interaction, json) {
    const commandName = interaction.message.interaction.commandName
    CommandsStats.create(commandName, `button - ${getTypePage(json)}`, interaction)

    loadingCard(interaction)

    return await require(`../../commands/${commandName}.js`)
      .sendCardWithInfo(interaction, json.s, json.page)
  },
  getJSON(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    return { ...json, ...JSON.parse(values) }
  }
}
