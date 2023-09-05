const Discord = require('discord.js')
const User = require('../database/user')
const { getCardsConditions, getInteractionOption } = require('../functions/commands')
const successCard = require('../templates/successCard')
const { updateRoles } = require('../functions/roles')
const errorCard = require('../templates/errorCard')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')

const sendCardWithInfo = async (interaction, playerParam) => {
  const discordId = interaction.user.id
  const discordUserId = getInteractionOption(interaction, 'discord_user')
  const nickname = getInteractionOption(interaction, 'nickname')
  const lang = interaction.locale

  if (discordUserId) {
    const guild = await interaction.guild.fetch()
    return guild.members.fetch(discordUserId)
      .then(async (member) => {
        const discordUserId = member.user.id

        if (!interaction.member.permissions.has('ManageRoles') && discordUserId !== discordId)
          return errorCard('error.user.permissions.manageRoles', lang)
        else if (member.user.bot) return errorCard('error.user.noBotLink', lang)

        const exists = await User.getWithGuild(discordUserId, null)
        if (exists)
          return errorCard(getTranslation('error.user.globalLink', lang, {
            discord: `<@${discordUserId}>`
          }), lang)

        return link(interaction, playerParam, discordUserId, guild.id, nickname)
      })
      .catch(() => errorCard('error.user.notFound', lang))
  }

  return link(interaction, playerParam, discordId, null, nickname)
}

const link = async (interaction, playerParam, discordId, guildId = null, nickname) => {
  const {
    playerDatas
  } = await getStats({
    playerParam,
    matchNumber: 1
  })

  const playerId = playerDatas.player_id

  if (!guildId) await User.remove(discordId)
  const user = await User.exists(discordId, guildId)

  user ?
    User.update(discordId, playerId, guildId, nickname || user.nickname) :
    User.create(discordId, playerId, guildId, nickname || false)

  if (await User.get(discordId)) updateRoles(interaction.client, discordId, guildId)

  return successCard(getTranslation('success.command.link', interaction.locale, {
    playerName: playerDatas.nickname,
    discord: `<@${discordId}>`
  }, interaction.locale))
}

module.exports = {
  name: 'link',
  options: [
    {
      name: 'steam_parameter',
      description: getTranslation('options.steamParameter', 'en-US'),
      descriptionLocalizations: getTranslations('options.steamParameter'),
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'faceit_parameter',
      description: getTranslation('options.faceitParameter', 'en-US'),
      descriptionLocalizations: getTranslations('options.faceitParameter'),
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true
    },
    {
      name: 'discord_user',
      description: getTranslation('options.discordUserLink', 'en-US'),
      descriptionLocalizations: getTranslations('options.discordUserLink'),
      required: false,
      type: Discord.ApplicationCommandOptionType.User,
      slash: true
    },
    {
      name: 'nickname',
      description: getTranslation('options.nicknameLink', 'en-US'),
      descriptionLocalizations: getTranslations('options.nicknameLink'),
      required: false,
      type: Discord.ApplicationCommandOptionType.Boolean,
      slash: true
    }
  ],
  description: getTranslation('command.link.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.link.description'),
  usage: '[<steam_parameter> <faceit_parameter>] <discord_user> <nickname>',
  example: 'steam_parameter: justdams',
  type: 'utility',
  async execute(interaction) {
    return getCardsConditions(interaction, sendCardWithInfo, 1, 'steam_parameter', 'faceit_parameter', false)
  }
}