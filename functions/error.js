const { logChannel } = require('../config.json')

module.exports = (interaction, error) => {
  interaction.followUp().catch(() => null)

  interaction.client.channels.fetch(logChannel).then(channel => {
    channel.send({
      content: `
\`\`\`js
Guild: ${interaction.guild.name} (${interaction.guild.id})
Channel: #${interaction.channel.name} (${interaction.channel.id})
User: ${interaction.user.tag} (${interaction.user.id})
Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', timeStyle: 'short', dateStyle: 'long' })}
${Error(error).stack}
\`\`\`
      `,
    })
  }).catch(console.error)
}