const Discord = require('discord.js')
const { color, name, defaultGame } = require('../config.json')
const errorCard = require('../templates/errorCard')
const GuildRoles = require('../database/guildRoles')
const GuildCustomRole = require('../database/guildCustomRole')
const successCard = require('../templates/successCard')
const { updateRoles, getRoleIds } = require('../functions/roles')
const { getTranslations, getTranslation } = require('../languages/setup')
const { isInteractionSubcommandEqual, getInteractionOption } = require('../functions/utility')
const { ephemeral } = require('./team')

const SETUP = 'setup'
const GENERATE = 'generate'
const REMOVE = 'remove'
const SETUP_ELO = 'setup_elo'
const REMOVE_ELO = 'remove_elo'

const setupRoles = async (interaction) => {
  await removeRoles(interaction, getInteractionOption(interaction, 'remove_old'))

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
      rolesFields.push(getTranslation('error.command.roleTooHigh', interaction.locale))
    } else {
      rolesFields.push(`<@&${roleId}>`)
      roles.push(roleId)
    }
  }

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setFooter({ text: `${name} ${getTranslation('strings.info', interaction.locale)}` })

  rolesFields.reverse().forEach((v, i) => card.addFields({ name: `Level ${10 - i}`, value: v, inline: true }))

  if (error === 0) {
    GuildRoles.create(
      interaction.guild.id,
      roles[0],
      roles[1],
      roles[2],
      roles[3],
      roles[4],
      roles[5],
      roles[6],
      roles[7],
      roles[8],
      roles[9]
    )

    roles.forEach((roleId, i) => GuildCustomRole.create(
      interaction.guild.id,
      roleId,
      color.levels[defaultGame][1 + i].min,
      color.levels[defaultGame][1 + i].max
    ))

    await updateRoles(interaction.client, null, interaction.guild.id)

    card.setColor(color.primary)
      .setDescription(getTranslation('success.command.setupRoles', interaction.locale))
  } else {
    card.setColor(color.error)
      .setDescription(getTranslation('error.command.invalidRoles', interaction.locale))
      .setFooter({ text: `${name} Error` })
  }

  return {
    embeds: [card],
    files: [new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })]
  }
}

const generateRoles = async (interaction) => {
  await removeRoles(interaction, getInteractionOption(interaction, 'remove_old'))
  const roles = []

  for (let i = 10; i >= 1; i--) {
    await interaction.guild.roles.create({
      name: `Level ${i}`,
      color: color.levels[defaultGame][i].color,
      permissions: []
    })
      .then(e => roles.push(e.id))
      .catch(console.error)
  }

  roles.reverse()

  await GuildRoles.remove(interaction.guild.id)
  GuildRoles.create(
    interaction.guild.id,
    roles[0],
    roles[1],
    roles[2],
    roles[3],
    roles[4],
    roles[5],
    roles[6],
    roles[7],
    roles[8],
    roles[9]
  )

  roles.forEach((roleId, i) => {
    i++

    GuildCustomRole.create(
      interaction.guild.id,
      roleId,
      color.levels[defaultGame][i].min,
      color.levels[defaultGame][i].max
    )
  })

  await updateRoles(interaction.client, null, interaction.guild.id)

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setDescription(getTranslation('success.command.generateRoles', interaction.locale))
    .setColor(color.primary)
    .setFooter({ text: `${name} ${getTranslation('strings.info', interaction.locale)}` })

  roles.reverse()

  roles.forEach(e => card.addFields({
    name: getTranslation(`options.levelRoles.${10 - roles.indexOf(e)}`, interaction.locale),
    value: `<@&${e}>`, inline: true
  }))

  return {
    embeds: [card],
    files: [new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })]
  }
}

const removeRoles = async (interaction, removeOnGuild) => {
  const guildRoles = await GuildRoles.getRolesOf(interaction.guild.id)
  if (!guildRoles) return

  const roles = getRoleIds(guildRoles)

  if (guildRoles) {
    if (removeOnGuild) {
      for (let i = 1; i <= 10; i++) {
        if (guildRoles[`level${i}`] && interaction.guild.roles.cache.has(guildRoles[`level${i}`]))
          await interaction.guild.roles.delete(guildRoles[`level${i}`]).catch(console.error)
      }
    }

    await GuildRoles.remove(interaction.guild.id)

    roles.forEach(async e => {
      await GuildCustomRole.remove(interaction.guild.id, e)
    })
  }
}

const setupEloRoles = async (interaction) => {
  const hexaRegex = /^#([0-9a-f]{3}){2}$/i
  const roleColor = getInteractionOption(interaction, 'role_color')
  const eloMin = getInteractionOption(interaction, 'elo_min')
  const eloMax = getInteractionOption(interaction, 'elo_max')

  if (!hexaRegex.test(roleColor))
    return errorCard('error.command.invalidColor', interaction.locale)

  if (eloMin > eloMax)
    return errorCard('error.command.invalidElo', interaction.locale)

  const roleName = getInteractionOption(interaction, 'role_name')

  const role = await interaction.guild.roles.create({
    name: roleName.slice(0, 100),
    color: roleColor,
    permissions: []
  })

  GuildCustomRole.create(interaction.guild.id, role.id, eloMin, eloMax)

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setDescription(getTranslation('success.command.setupEloRoles', interaction.locale))
    .setColor(color.primary)
    .setFooter({ text: `${name} ${getTranslation('strings.info', interaction.locale)}` })

  updateRoles(interaction.client, null, interaction.guild.id)

  return {
    embeds: [card],
    files: [new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })]
  }
}

const removeEloRole = async (interaction) => {
  const role = getInteractionOption(interaction, 'role')
  const botRole = interaction.guild.roles.botRoleFor(interaction.client.user)
  const comparaison = interaction.guild.roles.comparePositions(botRole, role)

  if (!interaction.guild.roles.cache.has(role) || comparaison < 0) return errorCard('error.command.invalidRole', interaction.locale)

  await interaction.guild.roles.delete(role)

  const guildRole = await GuildCustomRole.getOne(interaction.guild.id, role)
  if (guildRole) await GuildCustomRole.remove(interaction.guild.id, role)

  return successCard(getTranslation('success.command.removeRole', interaction.locale), interaction.locale)
}

module.exports = {
  name: 'roles',
  options: [
    {
      name: SETUP,
      description: getTranslation('options.setupRoles', 'en-US'),
      descriptionLocalizations: getTranslations('options.setupRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      ephemeral: true,
      options: [
        ...Array(10).fill('').map((k, i) => {
          return {
            name: `level_${i + 1}`,
            description: getTranslation(`options.levelRoles.${i + 1}`, 'en-US'),
            // eslint-disable-next-line camelcase
            description_localizations: getTranslations(`options.levelRoles.${i + 1}`),
            type: Discord.ApplicationCommandOptionType.Role,
            required: true
          }
        }),
        {
          name: 'remove_old',
          description: getTranslation('options.removeOldRoles', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.removeOldRoles'),
          type: Discord.ApplicationCommandOptionType.Boolean,
        }
      ]
    },
    {
      name: GENERATE,
      description: getTranslation('options.generateRoles', 'en-US'),
      descriptionLocalizations: getTranslations('options.generateRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      ephemeral: true,
      options: [
        {
          name: 'remove_old',
          description: getTranslation('options.removeOldRoles', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.removeOldRoles'),
          type: Discord.ApplicationCommandOptionType.Boolean,
        }
      ]
    },
    {
      name: REMOVE,
      description: getTranslation('options.removeRoles', 'en-US'),
      descriptionLocalizations: getTranslations('options.removeRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      ephemeral: true
    },
    {
      name: SETUP_ELO,
      description: getTranslation('options.setupEloRoles', 'en-US'),
      descriptionLocalizations: getTranslations('options.setupEloRoles'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      premium: true,
      ephemeral: true,
      options: [
        {
          name: 'role_name',
          description: getTranslation('options.eloRoleName', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.eloRoleName'),
          type: Discord.ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: 'role_color',
          description: getTranslation('options.eloRoleColor', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.eloRoleColor'),
          type: Discord.ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: 'elo_min',
          description: getTranslation('options.eloRoleMin', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.eloRoleMin'),
          type: Discord.ApplicationCommandOptionType.Integer,
          required: true
        },
        {
          name: 'elo_max',
          description: getTranslation('options.eloRoleMax', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.eloRoleMax'),
          type: Discord.ApplicationCommandOptionType.Integer,
          required: true
        },
      ]
    },
    {
      name: REMOVE_ELO,
      description: getTranslation('options.removeEloRole', 'en-US'),
      descriptionLocalizations: getTranslations('options.removeEloRole'),
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      ephemeral: true,
      options: [
        {
          name: 'role',
          description: getTranslation('options.eloRole', 'en-US'),
          // eslint-disable-next-line camelcase
          description_localizations: getTranslations('options.eloRole'),
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        }
      ]
    }
  ],
  description: getTranslation('command.roles.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.roles.description'),
  usage: `\n - ${GENERATE}\n - ${SETUP}\n - ${REMOVE} \n - ${SETUP_ELO} \n - ${REMOVE_ELO}`,
  type: 'utility',
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageRoles'))
      return errorCard('error.user.permissions.manageRoles', interaction.locale)

    if (!interaction.member.guild.members.me.permissions.has('ManageRoles'))
      return errorCard('error.bot.manageRoles', interaction.locale)

    if (isInteractionSubcommandEqual(interaction, SETUP)) return await setupRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, GENERATE)) return await generateRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, REMOVE)) return await removeRoles(interaction)
      .then(() => successCard(getTranslation('success.command.removeRoles', interaction.locale), interaction.locale))
    if (isInteractionSubcommandEqual(interaction, SETUP_ELO)) return await setupEloRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, REMOVE_ELO)) return await removeEloRole(interaction)
  }
}
