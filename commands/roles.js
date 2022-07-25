const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { isInteractionSubcommandEqual, getInteractionOption } = require('../functions/commands')
const errorCard = require('../templates/errorCard')
const GuildRoles = require('../database/guildRoles')
const successCard = require('../templates/successCard')
const { updateRoles } = require('../functions/roles')

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
    .setFooter({ text: `${name} Infos` })


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
      description: 'Setup the roles that you want for each ranks on the server.',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'level_1',
          description: 'The role for the level 1',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_2',
          description: 'The role for the level 2',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_3',
          description: 'The role for the level 3',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_4',
          description: 'The role for the level 4',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_5',
          description: 'The role for the level 5',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_6',
          description: 'The role for the level 6',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_7',
          description: 'The role for the level 7',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_8',
          description: 'The role for the level 8',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_9',
          description: 'The role for the level 9',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'level_10',
          description: 'The role for the level 10',
          type: Discord.ApplicationCommandOptionType.Role,
          required: true
        },
        {
          name: 'remove_old',
          description: 'Remove the old roles if they exist.',
          type: Discord.ApplicationCommandOptionType.Boolean,
        }
      ]
    },
    {
      name: GENERATE,
      description: 'Generates the rank roles on the server.',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'remove_old',
          description: 'Remove the old roles if they exist.',
          type: Discord.ApplicationCommandOptionType.Boolean,
        }
      ]
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
    if (isInteractionSubcommandEqual(interaction, GENERATE)) return await generateRoles(interaction)
    if (isInteractionSubcommandEqual(interaction, REMOVE)) return await removeRoles(interaction)
      .then(() => successCard('The roles have been removed'))
  }
}
