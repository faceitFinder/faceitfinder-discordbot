const { color } = require('../config.json')

module.exports.TYPES = {
  ELO: { name: 'ELO', gap: 1, fixe: 0, emoji: '📈', color: color.levels },
  KD: { name: 'K/D', gap: 100, fixe: 2, emoji: '📉', color: color.kd }
}
module.exports.getType = (t) => Object.entries(this.TYPES).filter(e => e[1].name === t)[0][1]