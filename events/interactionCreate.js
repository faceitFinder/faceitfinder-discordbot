const Discord = require('discord.js')

const editInteraction = (interaction, resp) => {
  if (!resp) return
  interaction.fetchReply()
    .then(e => {
      e.removeAttachments()
      e.edit(resp)
    })
    .catch((err) => console.log(err))
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
        const { id, s } = JSON.parse(interaction.customId)
        interaction.client.buttons.get(id)?.execute(interaction, s, id)
          .then(e => editInteraction(interaction, e))
      })
    } else if (interaction.client.commands.has(interaction.commandName)) {
      if (interaction.client.antispam.isIgnored(interaction.user.id, interaction.createdAt, interaction.channel)) return
      else {
        const message = {
          author: interaction.user,
          mentions: {
            users: new Discord.Collection()
          },
          content: ''
        }
        const args = []
        interaction.options['_hoistedOptions'].filter(o => o.type === 'STRING').forEach(o => {
          o.value.split(' ').forEach(e => { if (e !== '') args.push(e) })
          message.content += o.value
        })
        interaction.deferReply().then(async () => {
          interaction.client.commands.get(interaction.commandName)?.execute(message, args)
            .then(resp => {
              if (Array.isArray(resp)) {
                resp.forEach(r => {
                  interaction.followUp(r).catch((err) => console.log(err))
                })
              } else interaction.editReply(resp).catch((err) => console.log(err))
            }).catch((err) => console.log(err))
        })
      }
    }
  }
}