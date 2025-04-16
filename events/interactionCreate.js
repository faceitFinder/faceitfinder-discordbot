const noMention = require('../templates/noMention')
const errorCard = require('../templates/errorCard')
const { InteractionType, ApplicationCommandOptionType } = require('discord.js')
const CommandsStats = require('../database/commandsStats')
const { getTranslation } = require('../languages/setup')
const errorHandler = require('../functions/error')
const Interaction = require('../database/interaction')
const { updateCard } = require('../templates/loadingCard')
const { currentGuildIsPremium } = require('../functions/utility')
const premiumCard = require('../templates/premiumCard')
const { creator } = require('../config')

const editInteraction = (interaction, resp) => {
  if (!resp) return
  interaction.editReply(noMention(resp)).catch((error) => errorHandler(interaction, error))
}

const errorInteraction = (interaction, error, message) => {
  errorHandler(interaction, error)

  interaction.followUp(noMention(errorCard(typeof error !== 'string' ? message : error, interaction.locale)))
    .catch((error) => errorHandler(interaction, error))
}

const expiredInteraction = (interaction) => {
  interaction.deferUpdate().then(() => {
    editInteraction(interaction, {
      content: '```md\n# This interaction has expired```',
    })
    updateCard(interaction)
  })
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!!parseInt(process.env.TEST) && interaction.user.id !== creator) return

    /**
     * Checking if the user is temporary banned
     * when the interaction is command or context menu
     */
    if (
      interaction.type === InteractionType.ApplicationCommand &&
      interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)
    ) {
      return
    }
    /**
     * Check if the channel is accessible
     */
    else if (!interaction.channel.permissionsFor(interaction.client.user).has('ViewChannel')) {
      interaction
        .deferReply({ ephemeral: true })
        .then(() => {
          interaction
            .followUp({
              content: ' ',
              ...errorCard('error.bot.channelNotAccessible', interaction.locale),
            })
            .catch((error) => errorHandler(interaction, error))
        })
        .catch((error) => errorHandler(interaction, error))
    }
    /**
     * Check if the interaction is a selectmenu
     */
    else if (interaction.isStringSelectMenu()) {
      const interactionSelectMenu = interaction.client.selectmenus?.get(interaction.customId)
      if (!interactionSelectMenu) return

      const interactionDatas = await Interaction.getOne(interaction.values[0])
      if (!interactionDatas) {
        expiredInteraction(interaction)
        return
      }

      const json = interactionDatas.jsonData

      if (interaction.user.id === json.userId) {
        interaction
          .deferUpdate()
          .then(() => {
            CommandsStats.create(interaction.customId, 'selectmenu', interaction)
            interactionSelectMenu?.execute(interaction, json)
              .then(e => editInteraction(interaction, e))
              .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.selectmenu', interaction.locale)))
          })
          .catch((error) => errorHandler(interaction, error))
      } else {
        interaction
          .deferReply({ ephemeral: true })
          .then(() => {
            CommandsStats.create(interaction.customId, 'selectmenu', interaction)
            interactionSelectMenu?.execute(interaction, json, true)
              .then(e => interaction.editReply(noMention(e)).catch((error) => errorHandler(interaction, error)))
              .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.selectmenu', interaction.locale)))
          })
          .catch((error) => errorHandler(interaction, error))
      }
    }
    /**
     * Check if the interaction is a button
     */
    else if (interaction.isButton()) {
      const interactionDatas = await Interaction.getOne(interaction.customId)
      if (!interactionDatas) {
        expiredInteraction(interaction)
        return
      }

      const json = interactionDatas.jsonData
      const interactionButton = interaction.client.buttons?.get(json.id)

      if (!interactionButton) return

      if (interaction.user.id === json.userId) {
        interaction
          .deferUpdate().then(() => {
            interactionButton?.execute(interaction, json)
              .then(e => editInteraction(interaction, e))
              .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.button', interaction.locale)))
          }).catch((error) => errorHandler(interaction, error))
      } else {
        interaction.deferReply({ ephemeral: true }).then(() => {
          interactionButton?.execute(interaction, json, true)
            .then(e => interaction.editReply(noMention(e)).catch((error) => errorHandler(interaction, error)))
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.button', interaction.locale)))
        }).catch((error) => errorHandler(interaction, error))
      }
    }
    /**
     * Check if the interaction is a contextmenu
     */
    else if (interaction.type === InteractionType.ApplicationCommand && interaction.targetId !== undefined) {
      interaction
        .deferReply()
        .then(() => {
          CommandsStats.create(interaction.commandName, 'contextmenu', interaction)
          interaction.client.contextmenus.get(interaction.commandName)?.execute(interaction)
            .then(resp => interaction
              .followUp(resp)
              .catch((error) => errorHandler(interaction, error)))
            .catch(err => errorInteraction(interaction, err, getTranslation('error.execution.contextmenu', interaction.locale)))
        })
        .catch((error) => errorHandler(interaction, error))
    }
    /**
     * Check if the interaction is a command
     */
    else if (interaction.client.commands.has(interaction.commandName)) {
      const command = interaction.client.commands.get(interaction.commandName)
      const subCommand = command.options
        .filter(option => option.type === ApplicationCommandOptionType.Subcommand && option.name === interaction.options.getSubcommand())
        .shift()

      interaction
        .deferReply({ ephemeral: command.ephemeral ?? subCommand?.ephemeral })
        .then(async () => {
          const premiumSubCommand = subCommand?.premium
          if (premiumSubCommand) {
            const isPremium = await currentGuildIsPremium(interaction.client, interaction.guildId, true)
            if (!isPremium) {
              interaction.followUp({
                content: ' ',
                ...premiumCard(interaction.locale),
              }).catch((error) => errorHandler(interaction, error))
              return
            }
          }

          CommandsStats.create(interaction.commandName, 'command', interaction)
          command?.execute(interaction)
            .then(resp => {
              if (Array.isArray(resp)) {
                resp
                  .forEach(r => interaction
                    .followUp(r)
                    .catch((error) => errorHandler(interaction, error)))
              } else {
                interaction
                  .followUp(resp)
                  .catch((error) => errorHandler(interaction, error))
              }
            })
            .catch(err => {
              console.error(err)
              errorInteraction(interaction, err, getTranslation('error.execution.command', interaction.locale))
            })
        })
        .catch((error) => errorHandler(interaction, error))
    }
  }
}
