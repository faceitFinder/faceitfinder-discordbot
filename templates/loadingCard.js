const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { getTranslation } = require('../languages/setup')
const errorHandler = require('../functions/error')

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
          return new Discord.ButtonBuilder()
            .setCustomId(cc.customId)
            .setLabel(cc.label)
            .setEmoji(cc.emoji)
            .setStyle(cc.style)
            .setDisabled(true)
        }

        return cc
      })

      return c
    })
  }).catch((error) => errorHandler(interaction, error))
}


module.exports = {
  loadingCard,
  updateCard
}
