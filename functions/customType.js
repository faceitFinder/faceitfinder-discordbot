const { ButtonBuilder, StringSelectMenuOptionBuilder } = require('discord.js')
const { getTranslation } = require('../languages/setup')
const Interaction = require('../database/interaction')
const CustomType = require('../templates/customType')

const buildButtons = (interaction, buttonsValues, types, disabledType = null) =>
  Promise.all(types.map((t) => generateButtons(interaction, buttonsValues, t, disabledType)))

const buildButtonsGraph = (interaction, buttonValues) => buildButtons(interaction, buttonValues, [
  CustomType.TYPES.KD,
  CustomType.TYPES.ELO,
  CustomType.TYPES.ELO_KD
], CustomType.TYPES.ELO)

const generateButtons = async (interaction, values, type, disabledType = null) => {
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
    .setDisabled(type.name === disabledType.name)
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

const generateOption = async (interaction, { values, label, description }) => {
  const customId = (await Interaction.create(Object.assign({}, values, {
    u: interaction.user.id
  }))).id

  return new StringSelectMenuOptionBuilder()
    .setLabel(label)
    .setDescription(description)
    .setValue(customId)
}

module.exports = {
  generateButtons,
  updateButtons,
  buildButtonsGraph,
  buildButtons,
  generateOption
}