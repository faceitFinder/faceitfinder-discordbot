const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { getTranslation } = require('../languages/setup')
const errorHandler = require('../functions/error')
const Interaction = require('../database/interaction')

const loadingCard = (interaction) => {
  if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel')) return
  interaction.editReply({
    content: ' ',
    embeds: [
      new Discord.EmbedBuilder()
        .setColor(color.primary)
        .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
        .setDescription(getTranslation('strings.messageProcessing', interaction.locale))
        .setFooter({ text: `${name} ${getTranslation('strings.loading', interaction.locale)}` })
    ],
    attachments: [],
    components: [],
  }).catch((error) => errorHandler(interaction, error))
}

const updateCard = (interaction) => {
  if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel')) return
  interaction.editReply({
    components: interaction.message.components.map((c) => {
      c.components = c.components.map((cc) => {
        if (cc instanceof Discord.ButtonComponent) {
          const jsonButton = cc.toJSON()
          cc = new Discord.ButtonBuilder()
            .setCustomId(jsonButton.custom_id)
            .setLabel(jsonButton.label)
            .setStyle(jsonButton.style)
            .setDisabled(true)

          if (jsonButton.emoji) cc.setEmoji(jsonButton.emoji)

          Interaction.updateOne(cc.customId)
        }

        if (cc instanceof Discord.StringSelectMenuComponent) {
          const jsonSelectMenu = cc.toJSON()
          cc = new Discord.StringSelectMenuBuilder()
            .setCustomId(jsonSelectMenu.custom_id)
            .setPlaceholder(jsonSelectMenu.placeholder ?? '')
            .addOptions(jsonSelectMenu.options)
            .setDisabled(true)

          cc.options.forEach((option) => Interaction.updateOne(option.data.value))
        }

        return cc
      })

      return c
    })
  }).catch((error) => errorHandler(interaction, error))
}

const getCardByUserType = (newUser, interaction) => newUser ? loadingCard(interaction) : updateCard(interaction)

module.exports = {
  loadingCard,
  updateCard,
  getCardByUserType
}
