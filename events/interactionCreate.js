const { buildMessageFromInteraction } = require('../functions/commands')
const noMention = require('../templates/noMention')
const errorCard = require('../templates/errorCard')

const editInteraction = (interaction, resp) => {
  if (!resp) return
  interaction.fetchReply()
    .then(e => {
      e.removeAttachments().catch((err) => console.log(err))
      e.edit(noMention(resp)).catch((err) => console.log(err))
    })
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isSelectMenu()) {
      interaction.deferUpdate().then(() => {
        interaction.client.selectmenus.get(interaction.customId)?.execute(interaction)
          .then(e => editInteraction(interaction, e))
      })
    } else if (interaction.isButton()) {
      interaction.deferUpdate().then(() => {
        const json = JSON.parse(interaction.customId)
        interaction.client.buttons?.get(json.id)?.execute(interaction, json)
          .then(e => editInteraction(interaction, e))
      })
    } else if (interaction.client.commands.has(interaction.commandName)) {
      if (interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
      else {
        const { message, args } = buildMessageFromInteraction(interaction)
        interaction.deferReply().then(async () => {
          interaction.client.commands.get(interaction.commandName)?.execute(message, args)
            .then(resp => {
              if (Array.isArray(resp)) resp.forEach(r => interaction.followUp(r))
              else interaction.followUp(resp)
            })
            .catch((err) => {
              console.log(err)
              interaction.followUp(noMention(errorCard('An error has occured'))).catch((err) => console.log(err))
            })
        })
      }
    }
  }
}