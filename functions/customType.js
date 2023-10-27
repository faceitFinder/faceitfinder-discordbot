const { ButtonBuilder, StringSelectMenuOptionBuilder } = require('discord.js')
const { getTranslation } = require('../languages/setup')
const Interaction = require('../database/interaction')
const CustomType = require('../templates/customType')

const buildButtons = (interaction, buttonsValues, types, disabledType = null) =>
  Promise.all(types.map((t) => generateButtons(interaction, buttonsValues, t, disabledType)))

const buildButtonsGraph = (interaction, buttonValues, type = CustomType.TYPES.ELO) => buildButtons(interaction, buttonValues, [
  CustomType.TYPES.KD,
  CustomType.TYPES.ELO,
  CustomType.TYPES.ELO_KD
], type)

const generateButtons = async (interaction, values, type, disabledType = null) => {
  let name = type.name
  if (type.translate) name = getTranslation(name, interaction.locale)

  const customId = (await Interaction.create(Object.assign({}, values, {
    type,
    userId: interaction.user.id
  }))).id

  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(name)
    .setEmoji(type.emoji)
    .setStyle(type.style)
    .setDisabled(type.name === disabledType?.name)
}

const updateButtons = (components, type, jsonData = null) => {
  return components.map(button => {
    button = button.toJSON()
    const id = button.custom_id

    if (jsonData) {
      Interaction.getOne(id).then((data) => {
        const newJson = Object.assign({}, data.jsonData, jsonData, { type: CustomType.getTypeFromEmoji(button.emoji.name) })
        Interaction.updateOneWithJson(id, newJson)
      })
    } else Interaction.updateOne(id)

    return new ButtonBuilder()
      .setCustomId(id)
      .setLabel(button.label)
      .setEmoji(button.emoji)
      .setStyle(button.style)
      .setDisabled(button.label === type.name)
  })
}

const generateOption = async (interaction, { values, label, description }) => {
  const customId = (await Interaction.create(Object.assign({}, values, {
    userId: interaction.user.id
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