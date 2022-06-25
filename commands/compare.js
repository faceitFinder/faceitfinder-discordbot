const Discord = require('discord.js')
const { color } = require('../config.json')
const { getUsers } = require('../functions/commands')
const Player = require('../functions/player')
const DateStats = require('../functions/dateStats')
const CustomTypeFunc = require('../functions/customType')
const CustomType = require('../templates/customType')
const Graph = require('../functions/graph')
const User = require('../database/user')

const getPlayerDatas = async (obj) => {
  if (obj.discord) {
    const user = await User.exists(obj.param)
    if (user) obj.param = user.faceitId
    else throw `<@${obj.param}> hasn't linked his profile`
  }

  const playerId = obj.param
  const playerStats = await Player.getStats(playerId)
  const playerDatas = await Player.getDatas(playerId)
  const playerHistory = await DateStats.getPlayerHistory(playerId, 20)

  return {
    playerId,
    playerDatas,
    playerStats,
    playerHistory
  }
}

const sendCardWithInfos = async (interaction, player1, player2, type = CustomType.TYPES.ELO) => {
  const firstUserDatas = await getPlayerDatas(player1)
  const secondUserDatas = await getPlayerDatas(player2)
  const buttonValues = {
    id: 'uCSG',
    u: interaction.user.id
  }

  console.log(firstUserDatas.playerDatas, secondUserDatas.playerStats)

  const card = new Discord.MessageEmbed()
    .setAuthor({
      name: firstUserDatas.playerDatas.nickname,
      iconURL: firstUserDatas.playerDatas.avatar
    })
    .setDescription(`Comparison between [${firstUserDatas.playerDatas.nickname}](https://www.faceit.com/fr/players/${firstUserDatas.playerDatas.nickname}) and [${secondUserDatas.playerDatas.nickname}](https://www.faceit.com/fr/players/${secondUserDatas.playerDatas.nickname})`)
    .setColor(color.primary)

  const option = {
    label: `Compare ${firstUserDatas.playerDatas.nickname} and ${secondUserDatas.playerDatas.nickname}`,
    value: JSON.stringify({
      p1: firstUserDatas.playerId,
      p2: secondUserDatas.playerId,
    }),
    default: true
  }

  return {
    embeds: [card],
    components: [
      new Discord.MessageActionRow()
        .addComponents(new Discord.MessageSelectMenu()
          .setCustomId('compareStatsSelector')
          .addOptions([option])
          .setDisabled(true)),
      new Discord.MessageActionRow()
        .addComponents([
          CustomTypeFunc.generateButtons(
            { ...buttonValues, n: 1 },
            CustomType.TYPES.KD,
            type === CustomType.TYPES.KD),
          CustomTypeFunc.generateButtons(
            { ...buttonValues, n: 2 },
            CustomType.TYPES.ELO,
            type === CustomType.TYPES.ELO)
        ])
    ]
  }
}

module.exports = {
  name: 'compare',
  options: [{
    name: 'first_user_steam_parameters',
    description: 'steam parameter / @user',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'first_user_faceit_parameters',
    description: 'faceit nickname / @user',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'second_user_steam_parameters',
    description: 'steam parameter / @user',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'second_user_faceit_parameters',
    description: 'faceit nickname / @user',
    required: false,
    type: 3,
    slash: true
  },],
  description: 'Compare both user stats. If user 2 is null it will take your stats (need link).',
  usage: 'first_user:steam parameter OR faceit nickname OR @user AND second_user:steam parameter OR faceit nickname OR @user',
  type: 'stats',
  async execute(interaction) {
    const player1 = await getUsers(interaction, 1, 'first_user_steam_parameters', 'first_user_faceit_parameters')
    if (player1.length === 0) throw 'You need to specify the first player if you are linked, else the both players'
    const player2 = await getUsers(interaction, 1, 'second_user_steam_parameters', 'second_user_faceit_parameters')

    return sendCardWithInfos(interaction, player1.at(0), player2.at(0))
  }
}
