const CommandsStats = require('../../database/commandsStats')
const { sendCardWithInfo } = require('../../commands/last')
const { getTypePage } = require('../../functions/commandStats')
const loadingCard = require('../../templates/loadingCard')

module.exports = {
  name: 'pageLast',
  async execute(interaction, json) {
    CommandsStats.create('last', `button - ${getTypePage(json)}`, interaction)
    loadingCard(interaction)

    return sendCardWithInfo(interaction, {
      param: json.s,
      faceitId: true
    }, null, json.page, json.m)
  },
  getJSON(interaction, json) {
    const values = interaction.message.components.at(0).components.at(0).options.at(0).value
    return { ...json, ...JSON.parse(values) }
  },
}
