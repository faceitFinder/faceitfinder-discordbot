const Discord = require('discord.js')
const User = require('../database/user')
const { updateRoles } = require('../functions/roles')
const { getTranslation, getTranslations } = require('../languages/setup')
const errorCard = require('../templates/errorCard')
const successCard = require('../templates/successCard')
const { getInteractionOption } = require('../functions/utility')

const sendCardWithInfo = async (interaction) => {
  const discordId = interaction.user.id

  if (await User.exists(discordId) || getInteractionOption(interaction, 'global')) {
    await updateRoles(interaction.client, discordId, null, true)
    return successCard(getTranslation('success.command.unlink.global', interaction.locale), interaction.locale)
  } else if (await User.exists(discordId, interaction.guild.id)) {
    await updateRoles(interaction.client, discordId, interaction.guild.id, true)
    return successCard(getTranslation('success.command.unlink.server', interaction.locale), interaction.locale)
  }

  else return errorCard(getTranslation('error.user.notLinked', interaction.locale, {
    discord: `<@${discordId}>`
  }))
}

module.exports = {
  name: 'unlink',
  options: [
    {
      name: 'global',
      description: getTranslation('options.globalUnlink', 'en-US'),
      descriptionLocalizations: getTranslations('options.globalUnlink'),
      required: false,
      type: Discord.ApplicationCommandOptionType.Boolean,
      slash: true
    }
  ],
  description: getTranslation('command.unlink.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.unlink.description'),
  usage: '',
  type: 'utility',
  async execute(interaction) {
    return sendCardWithInfo(interaction)
  }
}