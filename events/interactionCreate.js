const noMention = require('../templates/noMention')
const errorCard = require('../templates/errorCard')
const { InteractionType } = require('discord.js')
const CommandsStats = require('../database/commandsStats')
const { getTranslation } = require('../languages/setup')

const editInteraction = (interaction, resp) => {
  if (!resp) return
  interaction.editReply(noMention(resp)).catch(console.error)
}

const errorInteraction = (interaction, error, message) => {
  console.error(error)
  interaction.followUp(noMention(errorCard(typeof error !== 'string' ? message : error, interaction.locale))).catch(console.error)
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    /**
     * Checking if the user is temporary banned
     * when the interaction is command or context menu
     */
    if (interaction.type === InteractionType.ApplicationCommand &&
      interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
    /**
     * Check if the channel is accessible
     */
    else if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel'))
      interaction
        .deferReply({ ephemeral: true })
        .then(() => {
          interaction
            .followUp({
              content: ' ',
              ...errorCard('error.bot.channelNotAccessible', interaction.locale),
            })
            .catch(console.error)
        })
        .catch(console.error)
    /**
     * Check if the interaction is a selectmenu
     */
    else if (interaction.isStringSelectMenu())
      interaction
        .deferUpdate()
        .then(() => {
          CommandsStats.create(interaction.customId, 'selectmenu', interaction)
          interaction.client.selectmenus?.get(interaction.customId)?.execute(interaction)
            .then(e => editInteraction(interaction, e))
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.selectmenu', interaction.locale)))
        })
        .catch(console.error)
    /**
     * Check if the interaction is a button
     */
    else if (interaction.isButton()) {
      const id = JSON.parse(interaction.customId)?.id
      const interactionButton = interaction.client.buttons?.get(id)
      if (!interactionButton) return

      const json = interactionButton.getJSON(interaction, JSON.parse(interaction.customId))

      if (interaction.user.id === json.u)
        interaction.deferUpdate().then(() => {
          interaction.client.buttons?.get(json.id)?.execute(interaction, json)
            .then(e => editInteraction(interaction, e))
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.button', interaction.locale)))
        }).catch(console.error)
      else
        interaction.deferReply({ ephemeral: true }).then(() => {
          interaction.client.buttons?.get(json.id)?.execute(interaction, json)
            .then(e => {

              interaction.editReply(noMention(e)).catch(console.error)
            })
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.button', interaction.locale)))
        }).catch(console.error)
    }
    /**
     * Check if the interaction is a contextmenu
     */
    else if (interaction.type === InteractionType.ApplicationCommand && interaction.targetId !== undefined)
      interaction
        .deferReply()
        .then(() => {
          CommandsStats.create(interaction.commandName, 'contextmenu', interaction)
          interaction.client.contextmenus.get(interaction.commandName)?.execute(interaction)
            .then(resp => interaction
              .followUp(resp)
              .catch(console.error))
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.contextmenu', interaction.locale)))
        })
        .catch(console.error)
    /**
     * Check if the interaction is a command
     */
    else if (interaction.client.commands.has(interaction.commandName))
      interaction
        .deferReply()
        .then(() => {
          CommandsStats.create(interaction.commandName, 'command', interaction)
          interaction.client.commands.get(interaction.commandName)?.execute(interaction)
            .then(resp => {
              if (Array.isArray(resp))
                resp
                  .forEach(r => interaction
                    .followUp(r)
                    .catch(console.error))
              else
                interaction
                  .followUp(resp)
                  .catch(console.error)
            })
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.command', interaction.locale)))
        })
        .catch(console.error)
  }
}
