const { ActionRowBuilder, ApplicationCommandOptionType } = require('discord.js')
const { getCardsConditions } = require('../functions/commands')
const Options = require('../templates/options')
const DateStats = require('../functions/dateStats')
const CustomType = require('../templates/customType')
const { getMapOption } = require('../functions/map')
const { getTranslations, getTranslation } = require('../languages/setup')
const { getStats } = require('../functions/apiHandler')
const { buildButtonsGraph } = require('../functions/customType')
const { getInteractionOption, getGameOption } = require('../functions/utility')

const buildButtons = async (interaction, values, type) => [
  new ActionRowBuilder()
    .addComponents(await buildButtonsGraph(interaction, Object.assign({}, values, {
      id: 'uLSG'
    }), type))
]

const sendCardWithInfo = async (interaction, playerParam, type = CustomType.TYPES.ELO) => {
  let { from, to } = DateStats.getFromTo(interaction)

  const map = getInteractionOption(interaction, 'map')
  const maxMatch = getInteractionOption(interaction, 'match_number') ?? 20
  const game = getGameOption(interaction)

  const {
    playerDatas
  } = await getStats({
    playerParam,
    matchNumber: 1,
    game
  })

  const values = {
    playerId: playerDatas.player_id,
    map,
    maxMatch,
    userId: interaction.user.id,
    game,
    from,
    type,
    to
  }

  const resp = await DateStats.getCardWithInfo({
    interaction,
    values,
    type,
    updateStartDate: true
  })

  values.from = resp.from
  values.to = resp.to

  resp.components = await buildButtons(interaction, values, type)

  return resp
}

const getOptions = () => {
  const options = structuredClone(Options.stats)
  options.push({
    name: 'match_number',
    description: getTranslation('options.matchNumber', 'en-US', {
      default: '20'
    }),
    descriptionLocalizations: getTranslations('options.matchNumber', {
      default: '20'
    }),
    required: false,
    type: ApplicationCommandOptionType.Integer,
    slash: true,
  }, getMapOption(), ...Options.dateRange)

  return options
}

module.exports = {
  name: 'laststats',
  options: getOptions(),
  description: getTranslation('command.laststats.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.laststats.description'),
  usage: `${Options.usage} <match_number> <map> ${Options.dateRangeUsage}`,
  example: 'steam_parameters: justdams match_number: 1000 from_date: 01/01/2022 to_date: 01/01/2023',
  type: 'stats',
  async execute(interaction) {
    return getCardsConditions({
      interaction,
      fn: sendCardWithInfo
    })
  }
}

module.exports.sendCardWithInfo = sendCardWithInfo
module.exports.buildButtons = buildButtons