const { prefix, color, name } = require('./config.json')
const Discord = require('discord.js')
const fetch = require('node-fetch')
const bot = new Discord.Client()

require('dotenv').config()

const headerFaceit = {
  Authorization: `Bearer ${process.env.FACEIT_TOKEN}`
}

bot.on('ready', () => {
  console.log('🚀 Bot started!')

  bot.user.setActivity(`${prefix}`, { type: 'PLAYING' })
})

bot.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return
  else {
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const firstArg = args.shift().toLowerCase()
    const steamId = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_TOKEN}&vanityurl=${firstArg}`)
      .then(res => {
        if (res.status == 200) return res.json()
        else throw 'An error has occured'
      })
      .then(data => {
        if (data.response.success == 1) return data.response.steamid
        else return firstArg
      })
    try {
      await fetch(`https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${steamId}`, {
        method: 'GET',
        headers: headerFaceit
      })
        .then(res => {
          if (res.status == 200) return res.json()
          else throw 'An error has occured'
        })
        .then(data => {
          const playerId = data.player_id
          fetch(`https://open.faceit.com/data/v4/players/${playerId}`, {
            method: 'GET',
            headers: headerFaceit
          })
            .then(res => {
              if (res.status == 200) return res.json()
              else throw 'An error has occured'
            })
            .then(data => {
              const faceitLevel = data.games.csgo.skill_level_label
              const faceitElo = data.games.csgo.faceit_elo
              const card = new Discord.MessageEmbed()
              card.setAuthor(data.nickname, data.avatar, `https://www.faceit.com/fr/players/${data.nickname}`)
                .setDescription(`Level: **${faceitLevel}**, Elo: **${faceitElo}**`)
                .setColor(color.levels[faceitLevel - 1])

              message.channel.send(card)
            })
        })
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