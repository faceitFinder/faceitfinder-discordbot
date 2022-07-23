const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { isInteractionSubcommandEqual } = require('../functions/commands')
const errorCard = require('../templates/errorCard')
const GuildRoles = require('../database/guildRoles')
const successCard = require('../templates/successCard')
const { updateRoles } = require('../functions/roles')

const SETUP = 'setup'
const REMOVE = 'remove'

const setupRoles = async (interaction) => {
  await removeRoles(interaction)

  const roles = []

  for (let i = 10; i >= 1; i--) {
    await interaction.guild.roles.create({
      name: `Level ${i}`,
      color: color.levels[i].color,
      permissions: []
    })
      .then(e => roles.push(e.id))
      .catch(console.error)
  }

  GuildRoles.create(interaction.guild.id,
    roles[9], roles[8], roles[7], roles[6], roles[5], roles[4], roles[3], roles[2], roles[1], roles[0])

  await updateRoles(interaction.client, null, interaction.guild.id)

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setDescription('The roles have been generated successfully')
    .setColor(color.primary)
    .setFooter({ text: `${name} Infos` })

  roles.forEach(e => card.addFields({ name: `Level ${10 - roles.indexOf(e)}`, value: `<@&${e}>`, inline: true }))

  return {
    embeds: [card],
    files: [new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })]
  }
}

const removeRoles = async (interaction) => {
  const guildRoles = await GuildRoles.getRolesOf(interaction.guild.id)

  if (guildRoles) {
    for (let i = 1; i <= 10; i++) {
      if (guildRoles[`level${i}`] && interaction.guild.roles.cache.has(guildRoles[`level${i}`]))
        await interaction.guild.roles.delete(guildRoles[`level${i}`]).catch(console.error)
    }
    await GuildRoles.remove(interaction.guild.id)
  }
}

module.exports = {
  name: 'roles',
  options: [
    {
      name: SETUP,
      description: 'Generates the rank roles on the server.',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true
    },
    {
      name: REMOVE,
      description: 'Removes the rank roles on the server.',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true
    }
  ],
  description: 'Ranks are updated every hour and when you get your personnal stats.',
  usage: `\n - ${SETUP}\n - ${REMOVE}`,
  type: 'utility',
  async execute(interaction) {
    if (!interaction.member.permissions.has(Discord.GatewayIntentBits.manageRoles))
      return errorCard('You don\'t have the permission to manage roles')

    if (!interaction.channel.permissionsFor(interaction.client.user).has('ManageRoles'))
      return errorCard('I don\'t have the permission to manage roles')

    if (isInteractionSubcommandEqual(interaction, SETUP)) return await setupRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, REMOVE)) return await removeRoles(interaction)
      .then(() => successCard('The roles have been removed'))
  }
}
