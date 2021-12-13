const Discord = require('discord.js')
const CustomType = require('../templates/customType')
const Graph = require('./graph')

const getGraph = (type, playerHistory, faceitElo, check = true, canvaSize = 20) => {
  if (type === CustomType.TYPES.ELO) return Graph.getElo(canvaSize, playerHistory, faceitElo, check)
  else if (type === CustomType.TYPES.KD) return Graph.getKD(playerHistory, canvaSize, type.gap)
}

const generateButtons = (values, type, disabled) => {
  return new Discord.MessageButton()
    .setCustomId(JSON.stringify(values))
    .setLabel(type.name)
    .setEmoji(type.emoji)
    .setStyle('SECONDARY')
    .setDisabled(disabled)
}

module.exports = {
  getGraph,
  generateButtons
}