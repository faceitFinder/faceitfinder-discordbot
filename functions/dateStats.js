const { color, emojis, defaultGame } = require('../config.json')
const Discord = require('discord.js')
const Graph = require('./graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const Interaction = require('../database/interaction')
const { getPagination, getMaxPage, getPageSlice } = require('./pagination')
const { getInteractionOption } = require('./commands')
const { getStats } = require('./apiHandler')
const { getTranslation } = require('../languages/setup')

const getDates = async (playerHistory, getDay) => {
  const dates = new Map()

  playerHistory.forEach(e => {
    const day = getDay(e.date)
    if (!dates.has(day)) dates.set(day, { number: 1, date: day })
    else dates.set(day, { number: dates.get(day).number + 1, date: day })
  })

  return dates
}

const setOptionDefault = option => {
  option.setEmoji(emojis.select.balise)
    .setDefault(true)

  return option
}

const getCardWithInfo = async ({
  interaction,
  values,
  type = CustomType.TYPES.ELO,
  updateStartDate = false
}) => {
  const playerId = values.playerId
  const today = new Date().setHours(24, 0, 0, 0)
  let startDate = values.from || ''
  const endDate = values.to || new Date().setHours(+24)
  const map = values.map ?? ''
  const game = values.game ?? defaultGame

  const {
    playerDatas,
    steamDatas,
    playerHistory,
    playerLastStats
  } = await getStats({
    playerParam: {
      param: playerId,
      faceitId: true
    },
    matchNumber: values.maxMatch,
    startDate,
    endDate,
    map: map,
    checkElo: +((startDate !== '' ? today >= startDate : true) && today <= endDate),
    game
  })

  if (!playerLastStats.games) throw getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  })

  const faceitLevel = playerDatas.games[game].skill_level
  const faceitElo = playerDatas.games[game].faceit_elo
  const size = 40

  const graphBuffer = Graph.generateChart(
    interaction.locale,
    playerDatas.nickname,
    playerHistory,
    playerLastStats.games + (CustomType.getType(type.name) === CustomType.TYPES.ELO),
    type,
    game
  )

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size, game)
  const toRealTimeStamp = new Date(endDate).setHours(-24)

  const head = []

  if (updateStartDate) startDate = playerLastStats.from

  if (startDate !== toRealTimeStamp) head.push({
    name: 'From - To', value: [new Date(startDate).toDateString(), '\n', new Date(toRealTimeStamp).toDateString()].join(' '),
    inline: !!map
  })
  else head.push({ name: 'From', value: new Date(startDate).toDateString(), inline: false })
  if (map) head.push({ name: 'Map', value: map, inline: true }, { name: '\u200b', value: '\u200b', inline: true })

  const card = new Discord.EmbedBuilder()
    .setAuthor({
      name: playerDatas.nickname,
      iconURL: playerDatas.avatar || null,
      url: `https://www.faceit.com/en/players/${playerDatas.nickname}`
    })
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games[game].game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
    .setThumbnail(`attachment://${faceitLevel}level.png`)
    .addFields(...head,
      { name: 'Highest Elo', value: playerLastStats['Highest Elo'].toString(), inline: true },
      { name: 'Lowest Elo', value: playerLastStats['Lowest Elo'].toString(), inline: true },
      { name: 'Current Elo', value: playerLastStats['Current Elo'].toString(), inline: true },
      { name: 'Games', value: `${playerLastStats.games} (${playerLastStats.winrate.toFixed(2)}% Win)`, inline: true },
      {
        name: 'Elo Gain',
        value: isNaN(playerLastStats.eloGain) ?
          '0'
          : playerLastStats.eloGain > 0 ?
            `+${playerLastStats.eloGain}`
            : playerLastStats.eloGain.toString(),
        inline: true
      },
      { name: 'Average MVPs', value: playerLastStats['Average MVPs'].toFixed(2), inline: true },
      { name: 'K/D', value: playerLastStats.kd.toFixed(2), inline: true },
      { name: 'Kills', value: playerLastStats.kills.toString(), inline: true },
      { name: 'Deaths', value: playerLastStats.deaths.toString(), inline: true },
      { name: 'Average K/D', value: playerLastStats['Average K/D'].toFixed(2), inline: true },
      { name: 'Average K/R', value: playerLastStats['Average K/R'].toFixed(2), inline: true },
      { name: 'Average HS', value: `${playerLastStats['Average HS'].toFixed(2)}%`, inline: true },
      { name: 'Average Kills', value: playerLastStats['Average Kills'].toFixed(2), inline: true },
      { name: 'Average Deaths', value: playerLastStats['Average Deaths'].toFixed(2), inline: true },
      { name: 'Average Assists', value: playerLastStats['Average Assists'].toFixed(2), inline: true },
      { name: 'Red K/D', value: playerLastStats['Red K/D'].toString(), inline: true },
      { name: 'Orange K/D', value: playerLastStats['Orange K/D'].toString(), inline: true },
      { name: 'Green K/D', value: playerLastStats['Green K/D'].toString(), inline: true })
    .setImage(`attachment://${values.playerId}graph.png`)
    .setColor(color.levels[game][faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}`, iconURL: 'attachment://game.png' })

  const files = [
    new Discord.AttachmentBuilder(graphBuffer, { name: `${values.playerId}graph.png` }),
    new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` }),
    new Discord.AttachmentBuilder(`images/${game}.png`, { name: 'game.png' })
  ]

  return {
    content: '',
    embeds: [card],
    files
  }
}

const generateDatasForCard = async ({
  interaction,
  playerParam,
  page = 0,
  game = '',
  functionToGetDates,
  formatFromToDates,
  formatLabel,
  selectTranslationString,
  type,
  defaultOption = 0
}) => {
  type ??= CustomType.TYPES.ELO

  const {
    playerDatas,
    playerHistory
  } = await getStats({
    playerParam,
    matchNumber: 0,
    game
  })

  const playerId = playerDatas.player_id
  const optionsValues = []
  const dates = await getDates(playerHistory, functionToGetDates)
  const maxMatch = 0
  const map = ''

  dates.forEach(date => {
    const {
      from,
      to
    } = formatFromToDates(date)

    let option = {
      label: formatLabel(from, to, interaction.locale),
      description: getTranslation('strings.matchPlayed', interaction.locale, { matchNumber: date.number }),
      values: {
        playerId,
        from,
        to,
        game,
        maxMatch,
        map,
        type
      }
    }

    optionsValues.push(option)
  })

  const maxPage = getMaxPage(optionsValues)
  optionsValues.forEach(option => {
    option.values.maxPage = maxPage
    option.values.currentPage = page
  })
  const pages = getPageSlice(page)
  const paginationOptionsRaw = optionsValues.slice(pages.start, pages.end)
  const values = paginationOptionsRaw[defaultOption].values
  const pagination = await Promise.all(paginationOptionsRaw.map(option => CustomTypeFunc.generateOption(interaction, option)))

  if (pagination.length === 0) return errorCard(getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  }), interaction.locale)

  pagination[defaultOption] = setOptionDefault(pagination.at(defaultOption))

  const resp = await getCardWithInfo({
    interaction,
    values,
    type
  })

  const components = [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('dateStatsSelector')
          .setPlaceholder(getTranslation(selectTranslationString, interaction.locale))
          .addOptions(pagination)
          .setDisabled(false)),
    new Discord.ActionRowBuilder()
      .addComponents(await CustomTypeFunc.buildButtonsGraph(interaction, Object.assign({}, values, {
        id: 'uDSG',
        maxPage,
        currentPage: page
      }), type))
  ]

  if (page !== null) components.push(await getPagination(interaction, page, maxPage, 'pageDS', values))

  resp.components = components

  return resp
}

const updateDefaultOption = (components, id, updateEmoji = true) => {
  return components.filter(e => e instanceof Discord.StringSelectMenuComponent)
    .map(msm => msm.options.map(o => {
      Interaction.updateOne(id)

      const active = o.value.normalize() === id.normalize()
      if (updateEmoji) o.emoji = active ? emojis.select.balise : undefined
      o.default = active

      return o
    })).at(0)
}

const updateOptionsType = (id, newType) => {
  Interaction.getOne(id).then(data => {
    const newJson = Object.assign({}, data.jsonData, { type: newType })
    Interaction.updateOneWithJson(id, newJson)
  })
}

const getFromTo = (interaction, nameFrom = 'from_date', nameTo = 'to_date') => {
  const from = new Date(getInteractionOption(interaction, nameFrom)?.trim())
  const to = new Date(getInteractionOption(interaction, nameTo)?.trim())

  return { from: new Date(from), to: new Date(to) }
}

module.exports = {
  getDates,
  getCardWithInfo,
  setOptionDefault,
  updateDefaultOption,
  updateOptionsType,
  getFromTo,
  generateDatasForCard
}
