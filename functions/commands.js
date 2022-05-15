const { prefix } = require('../config.json')
const User = require('../database/user')
const errorCard = require('../templates/errorCard')
const RegexFun = require('../functions/regex')
const noMention = require('../templates/noMention')

const getCards = async (interaction, array, fn) => {
  return Promise.all(array.map(async obj => {
    if (obj.discord) {
      const user = await User.exists(obj.param)
      if (user) return fn(interaction, user.steamId).catch(err => noMention(errorCard(err)))
      else return errorCard('This user hasn\'t linked his profile')
    } else return fn(interaction, obj.param).catch(err => noMention(errorCard(err)))
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

const getCardsConditions = async (interaction, fn, maxUser = 10, name = 'parameters') => {
  const parameters = getInteractionOption(interaction, 'team') || getInteractionOption(interaction, name)
  let args = parameters?.trim().split(' ') || []

  if (args.length === 0)
    return await User.get(interaction.user.id) ?
      getCards(interaction, [{ param: interaction.user.id, discord: true }], fn) :
      errorCard(`You need to link your account to do that without a parameter, do \`${prefix}help link\` to see how.`)

  const steamIds = RegexFun.findSteamUIds(parameters)
    .slice(0, maxUser)
    .map(e => { return { param: e, discord: false } })

  if (steamIds.length > 0) return getCards(interaction, steamIds, fn)

  let params = []
  args.forEach(e => {
    const res = RegexFun.findUserMentions(e)
    params = params.concat(
      res.length > 0 ?
        res.map(r => {
          return {
            param: r,
            discord: true
          }
        })
        : { param: e.split('/').filter(e => e).pop(), discord: false }
    )
  })

  return getCards(interaction, params.slice(0, maxUser), fn)
}

const getInteractionOption = (interaction, name) => {
  return interaction.options?._hoistedOptions?.filter(o => o.name === name)[0]?.value
}

const isInteractionSubcommandEqual = (interaction, name) => {
  return interaction.options?._subcommand === name
}

module.exports = {
  getCardsConditions,
  getInteractionOption,
  isInteractionSubcommandEqual
}