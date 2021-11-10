const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const Canvas = require('canvas')
const fs = require('fs')
const Match = require('../functions/match')
const Steam = require('../functions/steam')
const Player = require('../functions/player')
const Graph = require('../functions/graph')
const RegexFun = require('../functions/regex')
const errorCard = require('../templates/errorCard')
const { getCardsConditions } = require('../functions/commands')

const sendCardWithInfos = async (message = null, steamParam) => {
  try {
    const range = 6,
      steamId = await Steam.getId(steamParam),
      steamDatas = await Steam.getDatas(steamId),
      playerId = await Player.getId(steamId),
      playerDatas = await Player.getDatas(playerId),
      playerHistory = await Match.getMatchElo(playerId, range)

    if (!playerHistory.length > 0) return errorCard(`Couldn\'t get the last match of ${steamDatas.personaname}`)

    const faceitElo = playerDatas.games.csgo.faceit_elo,
      faceitLevel = playerDatas.games.csgo.skill_level,
      size = 40,
      filesAtt = [],
      cards = [],
      rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size),
      lastMatchsElo = await Graph.getElo(range, playerHistory, faceitElo)

    playerHistory.pop()
    filesAtt.push(new Discord.MessageAttachment(rankImageCanvas.toBuffer(), `${faceitLevel}.png`))

    playerHistory.forEach((m, i) => {
      const card = new Discord.MessageEmbed(),
        mapThumbnails = `./images/maps/${m.i1}.jpg`,
        result = Math.max(...m.i18.split('/').map(Number)) === parseInt(m.c5),
        eloDiff = lastMatchsElo[i] - lastMatchsElo[i + 1]

      if (parseInt(m.matchRound) > 1) card.addFields({ name: 'Rounds', value: m.matchRound })

      card.setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
        .setDescription(`[Steam](${steamDatas.profileurl}), [Game Lobby](https://www.faceit.com/fr/csgo/room/${m.matchId}/scoreboard)`)
        .addFields({ name: 'Score', value: m.i18, inline: true },
          { name: 'Map', value: m.i1, inline: true },
          { name: 'Status', value: result ? emojis.won.balise : emojis.lost.balise, inline: true },
          { name: 'K/D', value: m.c2, inline: true },
          { name: 'HS', value: `${m.c4}%`, inline: true },
          { name: 'MVPs', value: m.i9, inline: true },
          { name: 'Kills', value: m.i6, inline: true },
          { name: 'Deaths', value: m.i8, inline: true },
          { name: 'Assists', value: m.i7, inline: true },
          { name: 'Elo', value: isNaN(eloDiff) ? '0' : eloDiff.toString(), inline: true },
          { name: 'Date', value: new Date(m.date).toDateString(), inline: true })
        .setThumbnail(`attachment://${faceitLevel}.png`)
        .setImage(`attachment://${m.i1}.jpg`)
        .setColor(result ? color.won : color.lost)
        .setFooter(`Steam: ${steamDatas.personaname}`)

      const attachment = new Discord.MessageAttachment(mapThumbnails, `${m.i1}.jpg`)
      if (fs.existsSync(mapThumbnails) && !filesAtt.includes(attachment)) filesAtt.push(attachment)

      cards.push(card)
    })

    return {
      embeds: cards[0],
      files: filesAtt
    }

  } catch (error) {
    console.log(error)
    return errorCard(error)
  }
}

module.exports = {
  name: 'last',
  aliasses: ['last', 'l', 'lst'],
  options: [
    {
      name: 'user_steam_id',
      description: 'Steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'user_custom_steam_id',
      description: 'Custom steam id of a user.',
      required: false,
      type: 3
    },
    {
      name: 'steam_profile_link',
      description: 'Url of a steam profile.',
      required: false,
      type: 3
    },
    {
      name: 'csgo_status',
      description: 'The result of the "status" command in CS:GO that contains the user part.',
      required: false,
      type: 3
    },
    {
      name: 'user_mention',
      description: 'Mention a user that has linked his profile to the bot.',
      required: false,
      type: 6,
      slash: true
    }
  ],
  description: "Get the stats of last game played by you or the given user(s).",
  slashDescription: "Get the stats of the last game played by you or the @ user.",
  usage: 'one of the options',
  type: 'stats',
  async execute(message, args) {
    const steamIds = RegexFun.findSteamUIds(message.content)
    const params = []
    await args.forEach(async e => { params.push(e.split('/').filter(e => e).pop()) })

    return await getCardsConditions(message.mentions.users, steamIds, params, message, sendCardWithInfos)
  }
}