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
    const values = getDefaultInteractionOption(interaction).value
    json = { ...json, ...JSON.parse(values) }

    if (interaction.user.id !== json.u) return

    const commandName = interaction.message.interaction.commandName
    CommandsStats.create(commandName, `button - ${getTypePage(json)}`, interaction)

    loadingCard(interaction)

    return await require(`../../commands/${commandName}.js`)
      .sendCardWithInfo(interaction, json.s, json.page)
  }
}
