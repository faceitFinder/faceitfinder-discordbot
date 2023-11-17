const { getCardByUserType } = require('../../templates/loadingCard')
const { getMatchItems, sendCardWithInfo } = require('../../commands/last')
const { getStats } = require('../../functions/apiHandler')
const { updatePaginationComponents } = require('../../functions/pagination')
const { updateDefaultOption } = require('../../functions/utility')

const updateEmbedMessage = async (interaction, playerId, matchId, map, game) => {
  const {
    playerDatas,
    steamDatas,
    playerHistory
  } = await getStats({
    playerParam: {
      param: playerId,
      faceitId: true
    },
    matchNumber: 0,
    map: map,
    game
  })

  return getMatchItems(interaction, playerDatas, steamDatas, playerHistory, matchId, game)
}

module.exports = {
  name: 'lastSelector',
  async execute(interaction, values, newUser = false) {
    const optionsComponent = interaction.message.components.at(0)
    const pagination = interaction.message.components.at(1)
    
    updateDefaultOption(optionsComponent.components, interaction.values[0], false)

    getCardByUserType(newUser, interaction)

    if (newUser) {
      return sendCardWithInfo(
        interaction,
        { param: values.playerId, faceitId: true },
        values.matchId,
        values.currentPage,
        values.map,
        'lastSelector',
        'pageLast',
        values.maxMatch,
        values.game
      )
    }

    updatePaginationComponents(pagination.components, values)
    optionsComponent.components.at(0).data.disabled = false

    const components = [
      optionsComponent,
      pagination
    ]

    const messageItems = await updateEmbedMessage(interaction, values.playerId, values.matchId, values.map, values.game)

    return {
      ...messageItems,
      components
    }
  }
}