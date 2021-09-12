const User = require('../database/user')
const errorCard = require('../templates/errorCard')

const getCards = async (message, array, fn, mention = 0) => {
  const data = { embeds: [], files: [], components: [] }

  return await Promise.all(array.map(async u => {
    if (mention) {
      const user = await User.exists(u.id)
      if (user) return await fn(message, user.steamId)
      else return errorCard('**No players found**')
    } else return await fn(message, u)
  })).then(msgs => msgs.forEach(msg => {
    msg.embeds?.forEach(e => data.embeds.push(e))
    msg.files?.forEach(f => data.files.push(f))
    if (msg.content) data.content = msg.content
    msg.components?.forEach(e => data.components.push(e))
  })).then(() => data)
}

module.exports = {
  getCards
}