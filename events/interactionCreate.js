const noMention = require('../templates/noMention')
const errorCard = require('../templates/errorCard')

const editInteraction = (interaction, resp) => {
  if (!resp) return
  interaction.fetchReply()
    .then(e => {
      e.removeAttachments().catch(err => errorInteraction(interaction, err))
      e.edit(noMention(resp)).catch(err => errorInteraction(interaction, err))
    })
    .catch(err => errorInteraction(interaction, err))
}

const errorInteraction = (interaction, error) => {
  console.error(error)
  interaction.followUp(noMention(errorCard(error))).catch(console.error)
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.channel.permissionsFor(interaction.client.user).has('VIEW_CHANNEL'))
      interaction.deferReply({ ephemeral: true }).then(() => {
        interaction.followUp({
          content: ' ',
          ...errorCard('I do not have the permission to send messages in this channel.'),
          ephemeral: true
        })
          .catch(err => errorInteraction(interaction, err))
      })
        .catch(err => errorInteraction(interaction, err))
    else if (interaction.isSelectMenu())
      interaction.deferUpdate().then(() => {
        interaction.client.selectmenus?.get(interaction.customId)?.execute(interaction)
          .then(e => editInteraction(interaction, e))
          .catch(err => {
            console.error(err)
            editInteraction(interaction, errorCard('An error has occured'))
          })
      })
        .catch(err => errorInteraction(interaction, err))
    else if (interaction.isButton())
      interaction.deferUpdate().then(() => {
        const json = JSON.parse(interaction.customId)
        interaction.client.buttons?.get(json.id)?.execute(interaction, json)
          .then(e => editInteraction(interaction, e))
          .catch(err => {
            console.error(err)
            editInteraction(interaction, errorCard('An error has occured'))
          })
      })
        .catch(err => errorInteraction(interaction, err))
    else if (interaction.isContextMenu())
      if (interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
      else interaction.deferReply().then(async () => {
        interaction.client.contextmenus.get(interaction.commandName)?.execute(interaction)
          .then(resp => interaction.followUp(resp)
            .catch(err => errorInteraction(interaction, err)))
      }).catch(err => errorInteraction(interaction, err))
    else if (interaction.client.commands.has(interaction.commandName))
      if (interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
      else interaction.deferReply().then(async () => {
        interaction.client.commands.get(interaction.commandName)?.execute(interaction)
          .then(resp => {
            if (Array.isArray(resp)) resp.forEach(r => interaction.followUp(r)
              .catch(err => errorInteraction(interaction, err)))
            else interaction.followUp(resp)
              .catch(err => errorInteraction(interaction, err))
          })
          .catch(err => errorInteraction(interaction, 'An error has occured'))
      }).catch(console.error)
  }
}