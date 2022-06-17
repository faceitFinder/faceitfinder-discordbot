const { color } = require('../config.json')

module.exports.TYPES = {
  ELO: { name: 'ELO', emoji: '📈', color: color.levels, style: 'SECONDARY' },
  KD: { name: 'K/D', emoji: '📉', color: color.kd, style: 'SECONDARY' },
  ELO_KD: { name: 'ELO - K/D', emoji: '📊', style: 'SECONDARY' },
}
module.exports.getType = (t) => Object.entries(this.TYPES).filter(e => e[1].name === t)[0][1]