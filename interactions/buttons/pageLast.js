const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../../commands/last')
const { loadingCard } = require('../../templates/loadingCard')
const { getOptionsValues } = require('../../functions/commands')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json) {
    CommandsStats.create('last', `button - ${json.t.name}`, interaction)
    loadingCard(interaction)

    return sendCardWithInfo(
      interaction,
      { param: json.s, faceitId: true },
      null,
      json.page,
      json.m,
      'lastSelector',
      'pageLast',
      json.l,
      json.g
    )
  },
  getJSON(interaction, json) {
    const values = getOptionsValues(interaction)
    const maxMatch = interaction.message.components.at(3)?.components.at(0).customId
    if (maxMatch) json.l = JSON.parse(maxMatch).l

    return { ...json, ...values }
  },
}
