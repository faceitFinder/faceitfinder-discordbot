const { TYPES } = require('../templates/customType')

const getTypePage = (json) => json.n === 1 ? TYPES.FIRST.name : json.n === 3 ? TYPES.PREV.name : json.n === 2 ? TYPES.NEXT.name : TYPES.LAST.name

const getTypeGraph = (json) => json.n === 1 ? TYPES.KD.name : json.n === 2 ? TYPES.ELO.name : TYPES.ELO_KD.name

module.exports = {
  getTypePage,
  getTypeGraph
}