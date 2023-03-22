const { color } = require('../config.json')
const { ButtonStyle } = require('discord.js')

module.exports.TYPES = {
  ELO: { name: 'ELO', emoji: '📈', color: color.levels, style: ButtonStyle.Secondary, translate: false },
  KD: { name: 'K/D', emoji: '📉', color: color.kd, style: ButtonStyle.Secondary, translate: false },
  ELO_KD: { name: 'ELO - K/D', emoji: '📊', style: ButtonStyle.Secondary, translate: false },
  NEXT: { name: 'strings.pagination.next', emoji: '▶', style: ButtonStyle.Primary, translate: true },
  PREV: { name: 'strings.pagination.prev', emoji: '◀', style: ButtonStyle.Primary, translate: true },
  LAST: { name: 'strings.pagination.last', emoji: '⏭', style: ButtonStyle.Primary, translate: true },
  FIRST: { name: 'strings.pagination.first', emoji: '⏮', style: ButtonStyle.Primary, translate: true },
}

module.exports.getType = (t) => Object.entries(this.TYPES).filter(e => e[1].name === t)[0][1]