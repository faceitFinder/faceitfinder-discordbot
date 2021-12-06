const Discord = require('discord.js')
const CustomType = require('../templates/customType')
const Graph = require('./graph')

const getGraph = (type, playerHistory, faceitElo) => {
  if (type === CustomType.TYPES.ELO) return Graph.getElo(20, playerHistory, faceitElo)
  else if (type === CustomType.TYPES.KD) return Graph.getKD(playerHistory, 20, type.gap)
}
const generateButtons = (steamId, author, type, disabled, customId) => {
  return new Discord.MessageButton()
    .setCustomId(JSON.stringify({
      id: customId,
      s: steamId,
      u: author,
      t: type.name
    }))
    .setLabel(type.name)
    .setEmoji(type.emoji)
    .setStyle('SECONDARY')
    .setDisabled(disabled)
}

module.exports = {
  getGraph,
  generateButtons
}