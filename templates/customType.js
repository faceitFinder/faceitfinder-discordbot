const { color } = require('../config.json')
const { ButtonStyle } = require('discord.js')

module.exports.TYPES = {
  ELO: { name: 'ELO', emoji: '📈', color: color.levels, style: ButtonStyle.Secondary },
  KD: { name: 'K/D', emoji: '📉', color: color.kd, style: ButtonStyle.Secondary },
  ELO_KD: { name: 'ELO - K/D', emoji: '📊', style: ButtonStyle.Secondary },
  NEXT: { name: 'Next page', emoji: '▶', style: ButtonStyle.Primary },
  PREV: { name: 'Prev page', emoji: '◀', style: ButtonStyle.Primary },
  LAST: { name: 'Last page', emoji: '⏭', style: ButtonStyle.Primary },
  FIRST: { name: 'First page', emoji: '⏮', style: ButtonStyle.Primary },
}

module.exports.getType = (t) => Object.entries(this.TYPES).filter(e => e[1].name === t)[0][1]