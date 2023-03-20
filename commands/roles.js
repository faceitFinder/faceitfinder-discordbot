const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { isInteractionSubcommandEqual, getInteractionOption } = require('../functions/commands')
const errorCard = require('../templates/errorCard')
const GuildRoles = require('../database/guildRoles')
const successCard = require('../templates/successCard')
const { updateRoles } = require('../functions/roles')
const { getTranslations, getTranslation } = require('../languages/setup')

const SETUP = 'setup'
const GENERATE = 'generate'
const REMOVE = 'remove'

const setupRoles = async (interaction) => {
  if (getInteractionOption(interaction, 'remove_old')) await removeRoles(interaction)

  const roles = []
  const rolesFields = []
  const botRole = interaction.guild.roles.botRoleFor(interaction.client.user)
  let error = 0

  for (let i = 1; i <= 10; i++) {
    const roleId = getInteractionOption(interaction, `level_${i}`)
    const role = await interaction.guild.roles.fetch(roleId)

    const comparaison = interaction.guild.roles.comparePositions(botRole, role)
    if (comparaison < 0) {
      error++
      rolesFields.push('This role is higher than the bot role, please place it below the bot role.')
    } else {
      rolesFields.push(`<@&${roleId}>`)
      roles.push(roleId)
    }
  }

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setFooter({ text: `${name} Info` })


  rolesFields.reverse().forEach((v, i) => card.addFields({ name: `Level ${10 - i}`, value: v, inline: true }))

  if (error === 0) {
    await GuildRoles.remove(interaction.guild.id)
    GuildRoles.create(interaction.guild.id, roles[0], roles[1], roles[2], roles[3], roles[4], roles[5], roles[6], roles[7], roles[8], roles[9])

    await updateRoles(interaction.client, null, interaction.guild.id)

    card.setColor(color.primary)
      .setDescription('The roles have been setup successfully')
  } else {
    card.setColor(color.error)
      .setDescription('One or more roles are invalid')
      .setFooter({ text: `${name} Error` })
  }

  return {
    embeds: [card],
    files: [new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })]
  }
}

const generateRoles = async (interaction) => {
  if (getInteractionOption(interaction, 'remove_old')) await removeRoles(interaction)

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

  await GuildRoles.remove(interaction.guild.id)
  GuildRoles.create(interaction.guild.id, roles[9], roles[8], roles[7], roles[6], roles[5], roles[4], roles[3], roles[2], roles[1], roles[0])

  await updateRoles(interaction.client, null, interaction.guild.id)

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setDescription('The roles have been generated successfully')
    .setColor(color.primary)
    .setFooter({ text: `${name} Info` })

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
      description: getTranslation('options.setupRoles', 'en-US'),
      descriptionLocalization: getTranslations('options.setupRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        ...Array(10).fill('').map((k, i) => {
          return {
            name: `level_${i + 1}`,
            description: getTranslation(`options.levelRoles.${i + 1}`, 'en-US'),
            descriptionLocalization: getTranslations(`options.levelRoles.${i + 1}`),
            type: Discord.ApplicationCommandOptionType.Role,
            required: true
          }
        }),
        {
          name: 'remove_old',
          description: getTranslation('options.removeOldRoles', 'en-US'),
          descriptionLocalization: getTranslations('options.removeOldRoles'),
          type: Discord.ApplicationCommandOptionType.Boolean,
        }
      ]
    },
    {
      name: GENERATE,
      description: getTranslation('options.generateRoles', 'en-US'),
      descriptionLocalization: getTranslations('options.generateRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'remove_old',
          description: getTranslation('options.removeOldRoles', 'en-US'),
          descriptionLocalization: getTranslations('options.removeOldRoles'),
          type: Discord.ApplicationCommandOptionType.Boolean,
        }
      ]
    },
    {
      name: REMOVE,
      description: getTranslation('options.removeRoles', 'en-US'),
      descriptionLocalization: getTranslations('options.removeRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true
    }
  ],
  description: getTranslation('command.roles.description', 'en-US'),
  descriptionLocalization: getTranslations('command.roles.description'),
  usage: `\n - ${GENERATE}\n - ${SETUP}\n - ${REMOVE}`,
  type: 'utility',
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageRoles'))
      return errorCard(getTranslation('error.user.permissions.manageRoles', interaction.locale))

    if (!interaction.channel.permissionsFor(interaction.client.user).has('ManageRoles'))
      return errorCard(getTranslation('error.bot.manageRoles', interaction.locale))

    if (isInteractionSubcommandEqual(interaction, SETUP)) return await setupRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, GENERATE)) return await generateRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, REMOVE)) return await removeRoles(interaction)
      .then(() => successCard(getTranslation('success.command.removeRoles', interaction.locale), interaction.locale))
  }
}
