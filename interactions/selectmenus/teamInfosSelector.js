const { color, emojis, defaultGame } = require('../../config.json')
const Discord = require('discord.js')
const { getCardByUserType } = require('../../templates/loadingCard')
const UserTeam = require('../../database/userTeam')
const Team = require('../../database/team')
const User = require('../../database/user')
const errorCard = require('../../templates/errorCard')
const { getStats } = require('../../functions/apiHandler')
const { updateDefaultOption } = require('../../functions/utility')

module.exports = {
  name: 'teamInfoSelector',
  async execute(interaction, values, newUser = false) {
    const optionComponent = interaction.message.components.at(0).components
    
    updateDefaultOption(optionComponent, interaction.values[0], true)

    const components = [
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('teamInfoSelector')
            .addOptions(optionComponent.at(0).data.options))
    ]

    getCardByUserType(newUser, interaction)
  
    const currentTeam = await Team.getTeamSlug(values.slug)
    const teamUsers = await UserTeam.getTeamUsers(currentTeam.slug)

    // check if user is part of the team if not the creator
    let currentUser = await User.getWithGuild(interaction.user.id, null)
    if (!currentUser) currentUser = await User.getWithGuild(interaction.user.id, interaction.guild.id)

    if (currentTeam.creator !== interaction.user.id && currentUser) {
      const userIsPartOfTeam = teamUsers.find(user => user.faceitId === currentUser.faceitId)
      if (!userIsPartOfTeam) return {
        ...errorCard('error.command.teamNoAccess', interaction.locale),
        components
      }
    }

    const usersInfo = await Promise.all(teamUsers.map(async user => {
      const {
        playerDatas,
      } = await getStats({
        playerParam: {
          param: user.faceitId,
          faceitId: true
        },
        matchNumber: 1,
        game: defaultGame,
      })

      return {
        user: user,
        faceit: playerDatas
      }
    }))

    const embed = new Discord.EmbedBuilder()
      .setColor(color.primary)
      .setTitle(`${currentTeam.name}`)
      .setDescription(`**Slug**: ${currentTeam?.slug}\n**Public Access**: ${currentTeam.access ? 'Yes' : 'No'}`)

    if (usersInfo.length > 0) usersInfo.forEach(user => {
      embed.addFields({
        name: `${user.faceit.nickname}`,
        value: `[Steam](https://steamcommunity.com/profiles/${user.faceit.games[defaultGame].game_player_id})\n[Faceit](https://www.faceit.com/en/players/${user.faceit.nickname})`,
        inline: true,
      })
    })
    else embed.addFields({ name: 'Users', value: 'No users found', inline: true })

    return {
      embeds: [
        embed,
      ],
      components
    }
  }
}