const { getDefaultInteractionOption } = require('../../functions/commands')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'pageDS',
  async execute(interaction, json) {
    const values = getDefaultInteractionOption(interaction).value
    json = { ...json, ...JSON.parse(values) }

    if (interaction.user.id !== json.u) return

    loadingCard(interaction)

    return await require(`../../commands/${interaction.message.interaction.commandName}.js`)
      .sendCardWithInfos(interaction, json.s, json.page)
  }
}
