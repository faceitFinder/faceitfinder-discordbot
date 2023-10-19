const { logChannel } = require('../config.json')
const { getInteractionOption } = require('./commands')

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
Command: ${interaction.commandName}
Options: 
${getOptionsKeyValues(interaction)}
${Error(error).stack}
\`\`\`
      `,
    })
  }).catch(console.error)
}

const getOptionsKeyValues = (interaction) => {
  let keys = interaction.client.commands.get(interaction.commandName)?.options?.map(option => option.name)
  if (!keys?.length) return '' 

  keys = keys.map(key => `- ${key}: ${getInteractionOption(interaction, key) ?? ''}`)
  return keys.join('\n')
}
