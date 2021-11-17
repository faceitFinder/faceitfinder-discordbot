const { prefix } = require('../config.json')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const RegexFun = require('../functions/regex')

const getCards = async (message, array, fn) => {
  return await Promise.all(array.map(async obj => {
    if (obj.discord) {
      const user = await User.exists(obj.param)
      if (user) return await fn(message, user.steamId)
      else return errorCard('This user hasn\'t linked his profile')
    } else return await fn(message, obj.param)
  })).then(msgs => msgs.map(msg => {
    const data = {
      embeds: msg.embeds || [],
      files: msg.files || [],
      components: msg.components || []
    }

    if (msg.content) data.content = msg.content

    return data
  }))
}

const getCardsConditions = async (message, args, fn, maxUser = 10) => {
  const steamIds = RegexFun.findSteamUIds(message.content)
    .slice(0, maxUser)
    .map(e => { return { param: e, discord: false } })

  const params = args.map(e => {
    const regex = /<@!?([0-9]*)>/gi, res = regex.exec(e)
    return { param: res?.at(1) || e.split('/').filter(e => e).pop(), discord: res !== null }
  })

  console.log(args)

  if (steamIds.length > 0) return getCards(message, steamIds, fn)
  else if (params.slice(0, maxUser).length > 0) return getCards(message, params, fn)
  else if (await User.get(message.author.id)) return getCards(message, [{ param: message.author.id, discord: true }], fn)
  else return errorCard(`You need to link your account to do that without a parameter, do \`${prefix}help link\` to see how.`)
}

module.exports = {
  getCardsConditions
}