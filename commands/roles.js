const Discord = require('discord.js')
const { color, name } = require('../config.json')
const { isInteractionSubcommandEqual, getInteractionOption } = require('../functions/commands')
const errorCard = require('../templates/errorCard')
const GuildRoles = require('../database/guildRoles')

const SETUP = 'setup'

const setupRoles = (interaction) => {
  if (!interaction.member.permissions.has(Discord.GatewayIntentBits.manageRoles))
    return errorCard('You don\'t have the permission to manage roles')

  const generate = getInteractionOption(interaction, 'generate')
  if (generate) return generateRoles(interaction)
}

const generateRoles = async (interaction) => {
  if (!interaction.channel.permissionsFor(interaction.client.user).has('ManageRoles'))
    return errorCard('I don\'t have the permission to manage roles')

  const guildRoles = await GuildRoles.getRolesOf(interaction.guild.id)

  if (guildRoles) {
    for (let i = 1; i <= 10; i++) if (guildRoles[`level${i}`]) await interaction.guild.roles.delete(guildRoles[`level${i}`])
    await GuildRoles.remove(interaction.guild.id)
  }

  const roles = []

  for (let i = 1; i <= 10; i++) await interaction.guild.roles.create({
    name: `Level ${i}`,
    color: color.levels[i].color,
    permissions: []
  }).then(e => roles.push(e.id))

  GuildRoles.create(interaction.guild.id,
    roles[0], roles[1], roles[2], roles[3], roles[4], roles[5], roles[6], roles[7], roles[8], roles[9])

  const card = new Discord.EmbedBuilder()
    .setAuthor({ name: name, iconURL: 'attachment://logo.png' })
    .setDescription('The roles have been generated successfully')
    .setColor(color.primary)
    .setFooter({ text: `${name} Infos` })

  roles.forEach(e => card.addFields({ name: `Level ${roles.indexOf(e) + 1}`, value: `<@&${e}>`, inline: true }))

  return {
    embeds: [card],
    files: [new Discord.AttachmentBuilder('./images/logo.png', { name: 'logo.png' })]
  }
}

module.exports = {
  name: 'roles',
  options: [
    {
      name: SETUP,
      description: 'Setup the rank roles on the server.',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      slash: true,
      options: [
        {
          name: 'generate',
          description: 'Generate automatically the rank roles on the server. You don\'t need to specify the roles.',
          type: Discord.ApplicationCommandOptionType.Boolean,
          required: true
        },
        {
          name: 'level_1',
          description: 'Role that corresponds to the level 1.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_2',
          description: 'Role that corresponds to the level 2.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_3',
          description: 'Role that corresponds to the level 3.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_4',
          description: 'Role that corresponds to the level 4.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_5',
          description: 'Role that corresponds to the level 5.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_6',
          description: 'Role that corresponds to the level 6.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_7',
          description: 'Role that corresponds to the level 7.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_8',
          description: 'Role that corresponds to the level 8.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_9',
          description: 'Role that corresponds to the level 9.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        },
        {
          name: 'level_10',
          description: 'Role that corresponds to the level 10.',
          type: Discord.ApplicationCommandOptionType.Role,
          required: false
        }
      ]
    }
  ],
  description: 'Setup the roles on the server and attributes the role who fits the user rank.',
  usage: `\n - ${SETUP} [generate] {level1} {level2} {level3} {level4} {level5} {level6} {level7} {level8} {level9} {level10}`,
  type: 'utility',
  async execute(interaction) {
    if (isInteractionSubcommandEqual(interaction, SETUP)) return await setupRoles(interaction)
  }
}
