const { getCardByUserType, updateCard } = require('../../templates/loadingCard')
const CustomType = require('../../templates/customType')
const DateStats = require('../../functions/dateStats')
const { updateButtons } = require('../../functions/customType')
const { disabledOptions } = require('../../functions/pagination')

const sendCardWithInfo = async (interaction, values, newUser = false) => {
  let components = interaction.message.components
  const options = DateStats.updateDefaultOption(components.at(0).components, interaction.values[0])

  getCardByUserType(newUser, interaction)

  const resp = await DateStats.getCardWithInfo({
    interaction,
    values,
    type: values.type
  })

  components.at(0).components.at(0).data.options = options
  components.at(0).components.at(0).data.disabled = false
  components.at(1).components = await updateButtons(components.at(1).components, values.type, values)
  components.at(2).components.forEach((button) => {
    button.data.disabled = !!disabledOptions(values.currentPage, values.maxPage, CustomType.getTypeFromEmoji(button.data.emoji.name))
  })

  resp.components = components

  return resp
}

module.exports = {
  name: 'dateStatsSelector',
  async execute(interaction, json) {
    return sendCardWithInfo(interaction, json)
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo