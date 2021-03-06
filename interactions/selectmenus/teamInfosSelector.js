const { color, emojis } = require('../../config.json')
const Discord = require('discord.js')
const loadingCard = require('../../templates/loadingCard')
const UserTeam = require('../../database/userTeam')
const Team = require('../../database/team')
const User = require('../../database/user')
const Player = require('../../functions/player')
const Steam = require('../../functions/steam')
const errorCard = require('../../templates/errorCard')

module.exports = {
  name: 'teamInfosSelector',
  async execute(interaction) {
    const values = JSON.parse(interaction.values)
    if (values.u !== interaction.user.id) return

    const options = interaction.message.components.at(0).components
      .filter(e => e instanceof Discord.SelectMenuComponent)
      .map(msm => {
        return msm.options.map(o => {
          const active = JSON.stringify(JSON.parse(o.value)) === JSON.stringify(values)
          o.emoji = active ? emojis.select.balise : undefined
          o.default = active
          return o
        })
      }).at(0)

    const components = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId('teamInfosSelector')
          .addOptions(options))

    loadingCard(interaction)
    const currentTeam = await Team.getTeamSlug(values.tn)
    const teamUsers = await UserTeam.getTeamUsers(currentTeam.slug)

    // check if user is part of the team if not the creator
    const currentUser = await User.get(interaction.user.id)
    if (currentTeam.creator !== interaction.user.id && currentUser) {
      const userIsPartOfTeam = teamUsers.find(user => user.faceitId === currentUser.faceitId)
      if (!userIsPartOfTeam) return {
        ...errorCard('You are not part of this team'),
        components: [
          components
        ]
      }
    }

    const usersInfos = await Promise.all(teamUsers.map(async user => {
      const playerDatas = await Player.getDatas(user.faceitId)

      return {
        user: user,
        faceit: playerDatas
      }
    }))

    const embed = new Discord.EmbedBuilder()
      .setColor(color.primary)
      .setTitle(`${currentTeam.name}`)
      .setDescription(`**Slug**: ${currentTeam?.slug}\n**Public Access**: ${currentTeam.access ? 'Yes' : 'No'}`)

    if (usersInfos.length > 0) usersInfos.forEach(user => {
      embed.addFields({
        name: `${user.faceit.nickname}`,
        value: `[Steam](https://steamcommunity.com/profiles/${user.faceit.games.csgo.game_player_id})\n[Faceit](https://www.faceit.com/fr/players/${user.faceit.nickname})`,
        inline: true,
      })
    })
    else embed.addFields({ name: 'Users', value: 'No users found', inline: true })

    return {
      embeds: [
        embed,
      ],
      components: [
        components
      ]
    }
  }
}