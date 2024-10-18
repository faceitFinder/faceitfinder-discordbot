const { emojis, defaultGame } = require('../config')
const Interaction = require('../database/interaction')
const { StringSelectMenuOptionBuilder, StringSelectMenuComponent, EntitlementManager } = require('discord.js')

const generateOption = async (interaction, { values, label, description, emoji = null, defaultOption = false }) => {
  const customId = (await Interaction.create(Object.assign({}, values, {
    userId: interaction.user.id
  }))).id

  const option = new StringSelectMenuOptionBuilder()
    .setLabel(label)
    .setDescription(description)
    .setValue(customId)
    .setDefault(defaultOption)

  if (emoji) option.setEmoji(emoji)

  return option
}

const updateDefaultOption = (components, id, updateEmoji = true) => {
  return components.filter(e => e instanceof StringSelectMenuComponent)
    .map(msm => msm.options.map(o => {
      Interaction.updateOne(o.value)

      const active = o.value.normalize() === id.normalize()
      if (updateEmoji) o.emoji = active ? emojis.select.balise : undefined
      o.default = active

      return o
    })).at(0)
}

const setOptionDefault = option => {
  option.setEmoji(emojis.select.balise)
    .setDefault(true)

  return option
}

const isInteractionSubcommandEqual = (interaction, name) => {
  return interaction.options?._subcommand === name
}

const getInteractionOption = (interaction, name) => {
  return interaction.options?._hoistedOptions?.filter(o => o.name === name)[0]?.value
}

const getGameOption = (interaction) => {
  return interaction.options?._hoistedOptions?.filter(o => o.name === 'game')[0]?.value ?? defaultGame
}

const getCurrentEloString = (playerLastStats) => {
  return `${playerLastStats['Current Elo']} (-${playerLastStats.eloToPrev}/+${playerLastStats.eloToNext})`
}

const getActiveGuildsEntitlements = async (client) => {
  const entitlements = await new EntitlementManager(client).fetch()
  const activeGuildEntitlements = entitlements.filter(e => e.isActive() && e.isGuildSubscription())
  return activeGuildEntitlements
}

const currentGuildIsPremium = async (client, guildId) => {
  const premiumGuilds = await getActiveGuildsEntitlements(client)
  const isPremium = premiumGuilds.map(g => g.guildId).includes(guildId)
  return isPremium
}  

module.exports = {
  generateOption,
  updateDefaultOption,
  setOptionDefault,
  isInteractionSubcommandEqual,
  getInteractionOption,
  getGameOption,
  getCurrentEloString,
  getActiveGuildsEntitlements,
  currentGuildIsPremium
}