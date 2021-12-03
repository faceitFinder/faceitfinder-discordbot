module.exports.TYPES = {
  ELO: { n: 'ELO', g: 1, f: 0, e: '📈' },
  KD: { n: 'K/D', g: 100, f: 2, e: '📉' }
}

module.exports.getType = (t) => Object.entries(this.TYPES).filter(e => e[1].n === t)[0][1]