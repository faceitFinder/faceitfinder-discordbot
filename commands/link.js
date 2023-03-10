const Discord = require('discord.js')
const Player = require('../functions/player')
const User = require('../database/user')
const { getCardsConditions, getInteractionOption } = require('../functions/commands')
const successCard = require('../templates/successCard')
const { updateRoles } = require('../functions/roles')
const errorCard = require('../templates/errorCard')

const sendCardWithInfo = async (interaction, playerId) => {
  const discordId = interaction.user.id
  const discordUserId = getInteractionOption(interaction, 'discord_user')
  const nickname = getInteractionOption(interaction, 'nickname')

  if (discordUserId) {
    const guild = await interaction.guild.fetch()
    return guild.members.fetch(discordUserId)
      .then(async (member) => {
        const discordUserId = member.user.id

        if (!interaction.member.permissions.has('ManageRoles') && discordUserId !== discordId)
          return errorCard('You don\'t have the permission to manage roles', true)
        else if (member.user.bot) return errorCard('Sorry, but bots aren\'t really my type..')

        const exists = await User.getWithGuild(discordUserId, null)
        if (exists)
          return errorCard(`<@${discordUserId}> already has a global link.`)

        return link(interaction, playerId, discordUserId, guild.id, nickname)
      })
      .catch(() => errorCard('The requested user is not on this server.'))
  }

  return link(interaction, playerId, discordId, null, nickname)
}

const link = async (interaction, playerId, discordId, guildId = null, nickname) => {
  let playerDatas
  try { playerDatas = await Player.getDatas(playerId) }
  catch (error) { return errorCard(error) }

  if (!guildId) await User.remove(discordId)
  const user = await User.exists(discordId, guildId)

  user ?
    User.update(discordId, playerId, guildId, nickname || user.nickname) :
    User.create(discordId, playerId, guildId, nickname || false)

  if (await User.get(discordId)) updateRoles(interaction.client, discordId, guildId)

  return successCard(`<@${discordId}> has been linked to ${playerDatas.nickname}`)
}

module.exports = {
  name: 'link',
  options: [
    {
      name: 'steam_parameter',
      description: 'steamID / steam custom ID / url of one steam profile / @user / CSGO status.',
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'faceit_parameter',
      description: 'faceit nickname / @user',
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'discord_user',
      description: 'If specified the link will only work on this server (manage permission to link others).',
      required: false,
      type: Discord.ApplicationCommandOptionType.User,
      slash: true
    },
    {
      name: 'nickname',
      description: 'Make your discord nickname the same as your faceit nickname. (Only works with non admin users)',
      required: false,
      type: Discord.ApplicationCommandOptionType.Boolean,
      slash: true
    }
  ],
  description: 'Link a steam profile to the discord user, to get your stats directly (no parameters needed).',
  usage: '[<steam_parameter> <faceit_parameter>] <discord_user> <nickname>',
  example: 'steam_parameter: justdams',
  type: 'utility',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo, 1, 'steam_parameter', 'faceit_parameter')
  }
}