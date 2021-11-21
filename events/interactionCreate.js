const Discord = require('discord.js')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isSelectMenu()) {
      interaction.deferUpdate().then(() => {
        interaction.client.selectMenus.get(interaction.customId)?.execute(interaction)
          .then(resp => {
            interaction.fetchReply()
              .then(e => e.removeAttachments())
              .then(e => e.edit(resp))
              .catch((err) => console.log(err))
          })
      })
    } if (interaction.client.commands.has(interaction.commandName)) {
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
          await interaction.client.commands.get(interaction.commandName)?.execute(message, args)
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