const { fetchData } = require('./faceit')

const getFaceitPlayerDatas = (playerId) => fetchData(`https://open.faceit.com/data/v4/players/${playerId}`, 'error.command.faceitDatasNotFound')

module.exports = {
  getFaceitPlayerDatas,
}