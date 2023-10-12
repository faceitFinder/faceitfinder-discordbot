const { color, emojis } = require('../config.json')
const Discord = require('discord.js')
const Graph = require('./graph')
const CustomType = require('../templates/customType')
const CustomTypeFunc = require('../functions/customType')
const { getPagination } = require('./pagination')
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

const getCardWithInfo = async (
  interaction,
  actionRow,
  values,
  type,
  id,
  maxMatch,
  maxPage = null,
  page = null,
  map = null,
  updateStartDate = false,
  game = null
) => {
  const playerId = values.s
  const today = new Date().setHours(24, 0, 0, 0)
  let startDate = values.f * 1000 || ''
  const endDate = values.t * 1000 || new Date().setHours(+24)

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
    matchNumber: maxMatch,
    startDate,
    endDate,
    map: map || '',
    checkElo: +((startDate !== '' ? today >= startDate : true) && today <= endDate),
    game
  })

  if (!playerLastStats.games) throw getTranslation('error.user.noMatches', interaction.locale, {
    playerName: playerDatas.nickname
  })

  const faceitLevel = playerDatas.games.csgo.skill_level
  const faceitElo = playerDatas.games.csgo.faceit_elo
  const size = 40

  const graphBuffer = Graph.generateChart(
    interaction,
    playerDatas.nickname,
    playerHistory,
    playerLastStats.games + (type === CustomType.TYPES.ELO),
    type,
  )

  const rankImageCanvas = await Graph.getRankImage(faceitLevel, faceitElo, size)
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
    .setDescription(`[Steam](https://steamcommunity.com/profiles/${playerDatas.games.csgo.game_player_id}), [Faceit](https://www.faceit.com/en/players/${playerDatas.nickname})`)
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
    .setImage(`attachment://${values.s}graph.png`)
    .setColor(color.levels[faceitLevel].color)
    .setFooter({ text: `Steam: ${steamDatas?.personaname || steamDatas}` })

  const components = [
    ...[actionRow].flat(),
    new Discord.ActionRowBuilder()
      .addComponents([
        CustomTypeFunc.generateButtons(
          interaction,
          { id: id, n: 1 },
          CustomType.TYPES.KD,
          type === CustomType.TYPES.KD),
        CustomTypeFunc.generateButtons(
          interaction,
          { id: id, n: 2 },
          CustomType.TYPES.ELO,
          type === CustomType.TYPES.ELO),
        CustomTypeFunc.generateButtons(
          interaction,
          { id: id, n: 3 },
          CustomType.TYPES.ELO_KD,
          type === CustomType.TYPES.ELO_KD)
      ])]

  if (page !== null) components.push(getPagination(interaction, page, maxPage, 'pageDS'))

  return {
    embeds: [card],
    content: null,
    files: [
      new Discord.AttachmentBuilder(graphBuffer, { name: `${values.s}graph.png` }),
      new Discord.AttachmentBuilder(rankImageCanvas, { name: `${faceitLevel}level.png` })
    ],
    components: components
  }
}

const buildButtonValues = (json, optionJson) => {
  return JSON.stringify({
    s: json.s,
    f: json.f,
    t: json.t
  })
}

const updateOptions = (components, values, updateEmoji = true) => {
  return components.filter(e => e instanceof Discord.StringSelectMenuComponent)
    .map(msm => msm.options.map(o => {
      // Do not reset if a button is clicked
      try {
        setOptionValues(o, values)
        if (values.id.normalize() === 'uDSG') return o
      } catch (error) { }

      const active = o.value.normalize() === (typeof values === 'object' ? buildButtonValues(values) : values).normalize()
      if (updateEmoji) o.emoji = active ? emojis.select.balise : undefined
      o.default = active

      return o
    })).at(0)
}

const setOptionValues = (option, values) => {
  const oValue = JSON.parse(option.value)
  if (oValue.u) oValue.u = values.u
  option.value = JSON.stringify(oValue)
  return option
}

const getFromTo = (interaction, nameFrom = 'from_date', nameTo = 'to_date') => {
  const from = new Date(getInteractionOption(interaction, nameFrom)?.trim())
  const to = new Date(getInteractionOption(interaction, nameTo)?.trim())

  return { from: new Date(from), to: new Date(to) }
}

const buildRows = (row, interaction, game, stringTranslation) => {
  const selectDate = getTranslation(stringTranslation, interaction.locale)

  return [
    new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('dateStatsSelectorInfo')
          .setPlaceholder(selectDate)
          .addOptions({
            label: selectDate,
            description: selectDate,
            value: JSON.stringify({
              u: interaction.user.id,
              g: game
            })
          })
          .setDisabled(true)),
    row
  ]
}


module.exports = {
  getDates,
  getCardWithInfo,
  setOptionDefault,
  updateOptions,
  getFromTo,
  setOptionValues,
  buildRows
}
