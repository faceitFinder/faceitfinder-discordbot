const { prefix } = require('../config.json')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const Discord = require('discord.js')
const maxUser = 10

const getCards = async (message, array, fn, mention = 0) => {
  const messages = []

  return await Promise.all(array.map(async u => {
    if (mention) {
      const user = await User.exists(u.id)
      if (user) return await fn(message, user.steamId)
      else return errorCard('This user hasn\'t linked his profile')
    } else return await fn(message, u)
  })).then(msgs => msgs.forEach(msg => {
    const data = { embeds: [], files: [], components: [] }
    msg.embeds?.forEach(e => data.embeds.push(e))
    msg.files?.forEach(f => data.files.push(f))
    if (msg.content) data.content = msg.content
    msg.components?.forEach(e => data.components.push(e))
    messages.push(data)
  })).then(() => messages)
}

const getCardsConditions = async (mentions, steamIds, args, message, fn) => {
  mentions = new Discord.Collection(Array.from(mentions).slice(0, maxUser)),
    steamIds = steamIds.slice(0, maxUser), message = args.slice(0, maxUser)
  if (mentions.size > 0) return getCards(message, mentions, fn, 1)
  else if (steamIds.length > 0) return getCards(message, steamIds, fn)
  else if (args.length > 0) return getCards(message, args, fn)
  else if (await User.get(message.author.id)) return getCards(message, [message.author], fn, 1)
  else return errorCard(`You need to link your account to do that without a parameter, do \`${prefix}help link\` to see how.`)
}

module.exports = {
  getCardsConditions
}