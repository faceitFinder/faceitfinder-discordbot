const { ButtonBuilder } = require('discord.js')
const { getTranslation } = require('../languages/setup')
const Interaction = require('../database/interaction')
const CustomType = require('../templates/customType')

const buildButtons = (interaction, buttonsValues, types) => Promise.all(types.map((t) => generateButtons(interaction, buttonsValues, t)))

const buildButtonsGraph = (interaction, buttonValues) => buildButtons(interaction, buttonValues, [
  CustomType.TYPES.KD,
  CustomType.TYPES.ELO,
  CustomType.TYPES.ELO_KD
])

const buildButtonsPagination = (interaction, buttonValues) => buildButtons(interaction, buttonValues, [
  CustomType.TYPES.FIRST,
  CustomType.TYPES.NEXT,
  CustomType.TYPES.PREVIOUS,
  CustomType.TYPES.LAST
])

const generateButtons = async (interaction, values, type) => {
  let name = type.name
  if (type.translate) name = getTranslation(name, interaction.locale)

  const customId = (await Interaction.create(Object.assign({}, values, {
    t: type,
    u: interaction.user.id
  }))).id

  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(name)
    .setEmoji(type.emoji)
    .setStyle(type.style)
}

const updateButtons = (components, type) => {
  return components.map(button => {
    button = button.toJSON()
    Interaction.updateOne(button.custom_id)

    return new ButtonBuilder()
      .setCustomId(button.custom_id)
      .setLabel(button.label)
      .setEmoji(button.emoji)
      .setStyle(button.style)
      .setDisabled(button.label === type.name)
  })
}

module.exports = {
  generateButtons,
  updateButtons,
  buildButtonsGraph,
  buildButtonsPagination,
  buildButtons
}