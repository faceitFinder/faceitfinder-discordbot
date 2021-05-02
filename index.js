const { prefix, color, name } = require('./config.json')
const Player = require('./functions/player')
const Steam = require('./functions/steam')
const Discord = require('discord.js')
const bot = new Discord.Client()

require('dotenv').config()

bot.on('ready', () => {
  console.log('🚀 Bot started!')

  bot.user.setActivity(`${prefix}`, { type: 'PLAYING' })
})

bot.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return
  else {
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const firstArg = args.shift().toLowerCase().split('/').filter(e => e).pop()

    const steamId = await Steam.getId(firstArg)
    try {
      const playerId = await Player.getId(steamId)
      const playerDatas = await Player.getDatas(playerId)
      const playerStats = await Player.getStats(playerId)

      const faceitLevel = playerDatas.games.csgo.skill_level_label
      const faceitElo = playerDatas.games.csgo.faceit_elo

      const card = new Discord.MessageEmbed()
        .setAuthor(playerDatas.nickname, playerDatas.avatar, `https://www.faceit.com/fr/players/${playerDatas.nickname}`)
        .setDescription(`
          Level: **${faceitLevel}**, 
          Elo: **${faceitElo}**, 
          Games: **${playerStats.lifetime.Matches} (${playerStats.lifetime['Win Rate %']}% Win)**,
          K/D: **${playerStats.lifetime['Average K/D Ratio']}**
        `)
        .setColor(color.levels[faceitLevel - 1])

      message.channel.send(card)
    } catch (error) {
      console.log(error)
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(color.error)
          .setDescription('**No players found**')
          .setFooter(`${name} Error`)
      )
    }
  }
})

// Start the bot
bot.login(process.env.TOKEN)