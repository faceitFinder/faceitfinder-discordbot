const User = require('../database/user')
const errorCard = require('../templates/errorCard')

const getCardsMentions = async (message, array, fn) => {
  const data = { embeds: [], files: [] }

  return await Promise.all(array.map(async u => {
    const user = await User.exists(u.id)
    if (user) return await fn(message, user.steamId)
    else return errorCard('**No players found**')
  })).then(msgs => msgs.forEach(msg => {
    msg.embeds.forEach(e => data.embeds.push(e))
    msg.files?.forEach(f => data.files.push(f))
  })).then(() => data)
}

const getCardsParams = async (message, array, fn) => {
  const data = { embeds: [], files: [] }

  return await Promise.all(array.map(async u => {
    return await fn(message, u)
  })).then(msgs => msgs.forEach(msg => {
    msg.embeds.forEach(e => data.embeds.push(e))
    msg.files?.forEach(f => data.files.push(f))
  })).then(() => data)
}


module.exports = {
  getCardsMentions,
  getCardsParams,
}