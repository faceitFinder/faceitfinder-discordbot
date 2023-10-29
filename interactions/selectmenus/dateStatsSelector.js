const { getCardByUserType } = require('../../templates/loadingCard')
const DateStats = require('../../functions/dateStats')
const { updateButtons } = require('../../functions/customType')
const { updatePaginationComponents } = require('../../functions/pagination')

const sendCardWithInfo = async (interaction, values, newUser = false) => {
  const commandName = await interaction.message.fetchReference()
    .then((message) => message.interaction.commandName)
    .catch(() => interaction.message.interaction.commandName)
  let components = interaction.message.components
  const options = DateStats.updateDefaultOption(components.at(0).components, interaction.values[0])

  getCardByUserType(newUser, interaction)

  if (newUser) {
    return await require(`../../commands/${commandName}.js`)
      .sendCardWithInfo(
        interaction,
        { param: values.playerId, faceitId: true },
        values.currentPage,
        values.game,
        values.type,
        options.findIndex(option => option.default)
      )
  }

  const resp = await DateStats.getCardWithInfo({
    interaction,
    values,
    type: values.type
  })

  components.at(0).components.at(0).data.options = options
  components.at(0).components.at(0).data.disabled = false
  components.at(1).components = await updateButtons(components.at(1).components, values.type, values)
  updatePaginationComponents(components.at(2).components, values)

  resp.components = components

  return resp
}

module.exports = {
  name: 'dateStatsSelector',
  async execute(interaction, json, newUser) {
    return sendCardWithInfo(interaction, json, newUser)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo