const noMention = require('../templates/noMention')
const errorCard = require('../templates/errorCard')

const editInteraction = (interaction, resp) => {
  if (!resp) return
  interaction.fetchReply()
    .then(e => {
      e.removeAttachments().catch(console.error)
      e.edit(noMention(resp)).catch(console.error)
    })
    .catch(console.error)
}

const errorInteraction = (interaction, error, message) => {
  console.error(error)
  interaction.followUp(noMention(errorCard(message))).catch(console.error)
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    /**
     * Checking if the user is temporary banned
     * when the interaction is command or context menu
     */
    if (interaction.isCommand() ||
      interaction.isContextMenu() &&
      interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
    /**
     * Check if the channel is accessible
     */
    else if (!interaction.channel.permissionsFor(interaction.client.user).has('VIEW_CHANNEL'))
      interaction
        .deferReply({ ephemeral: true })
        .then(() => {
          interaction
            .followUp({
              content: ' ',
              ...errorCard('I do not have the permission to send messages in this channel.'),
              ephemeral: true
            })
            .catch(console.error)
        })
        .catch(console.error)
    /**
     * Check if the interaction is a selectmenu
     */
    else if (interaction.isSelectMenu())
      interaction
        .deferUpdate()
        .then(() => {
          interaction.client.selectmenus?.get(interaction.customId)?.execute(interaction)
            .then(e => editInteraction(interaction, e))
            .catch(err => errorInteraction(interaction, err, 'An error occured while executing the select menu.'))
        })
        .catch(console.error)
    /**
     * Check if the interaction is a button
     */
    else if (interaction.isButton())
      interaction
        .deferUpdate()
        .then(() => {
          const json = JSON.parse(interaction.customId)
          interaction.client.buttons?.get(json.id)?.execute(interaction, json)
            .then(e => editInteraction(interaction, e))
            .catch(err => errorInteraction(interaction, err, 'An error occured while executing the button.'))
        })
        .catch(console.error)
    /**
     * Check if the interaction is a contextmenu
     */
    else if (interaction.isContextMenu())
      interaction
        .deferReply()
        .then(() => {
          interaction.client.contextmenus.get(interaction.commandName)?.execute(interaction)
            .then(resp => interaction
              .followUp(resp)
              .catch(console.error))
            .catch(err => errorInteraction(interaction, err, 'An error occured while executing the contextmenu.'))
        })
        .catch(console.error)
    /**
     * Check if the interaction is a command
     */
    else if (interaction.client.commands.has(interaction.commandName))
      interaction
        .deferReply()
        .then(() => {
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
            .catch(err => errorInteraction(interaction, err, 'An error occured while executing the command.'))
        })
        .catch(console.error)
  }
}