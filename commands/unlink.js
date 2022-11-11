const Discord = require('discord.js')
const User = require('../database/user')
const { getInteractionOption } = require('../functions/commands')
const { updateRoles } = require('../functions/roles')
const errorCard = require('../templates/errorCard')
const successCard = require('../templates/successCard')

const sendCardWithInfos = async (interaction) => {
  const discordId = interaction.user.id

  if (await User.exists(discordId) || getInteractionOption(interaction, 'global')) {
    await updateRoles(interaction.client, discordId, null, true)
    return successCard('Your account has been globaly unlinked.')
  } else if (await User.exists(discordId, interaction.guild.id)) {
    await updateRoles(interaction.client, discordId, interaction.guild.id, true)
    return successCard('Your account has been unlinked on this server.')
  }

  else return errorCard('Your account is not linked to a user.')
}

module.exports = {
  name: 'unlink',
  options: [
    {
      name: 'global',
      description: 'This will unlink your account on all servers (False by default)',
      required: false,
      type: Discord.ApplicationCommandOptionType.Boolean,
      slash: true
    }
  ],
  description: 'Unlink your steam id to the discord bot.',
  usage: '',
  type: 'utility',
  async execute(interaction) {
    return sendCardWithInfos(interaction)
  }
}