const DateStats = require('../../functions/dateStats')
const { getCardByUserType } = require('../../templates/loadingCard')
const { buildEmbed, sendCardWithInfo } = require('../../commands/map')

module.exports = {
  name: 'mapSelector',
  async execute(interaction, values, newUser = false) {
    const {
      playerId,
      game,
      map,
      mode
    } = values
    const optionsComponent = interaction.message.components.at(0)
    let components

    DateStats.updateDefaultOption(optionsComponent.components, interaction.values[0], false)

    getCardByUserType(newUser, interaction)

    if (newUser) {
      return sendCardWithInfo(interaction, { param: playerId, faceitId: true }, map, mode, game)
    }

    const {
      embeds,
      files
    } = await buildEmbed(interaction, playerId, map, mode, game)

    optionsComponent.components.at(0).data.disabled = false
    components = [
      optionsComponent,
    ]

    return {
      content: '',
      embeds,
      files,
      components
    }
  }
}