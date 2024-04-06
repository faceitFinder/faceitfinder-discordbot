const axios = require('axios')
const axiosRetry = require('axios-retry').default

axiosRetry(axios, { retries: 3 })

const formatParam = (playerParam) => {
  return {
    faceit: !playerParam.steam && !playerParam.faceitId ? playerParam.param : '',
    steam: playerParam.steam ? playerParam.param : '',
    id: playerParam.faceitId ? playerParam.param : ''
  }
}

const getLadder = async ({
  playerParam,
  region = '',
  country = '',
  game = ''
}) => {
  const {
    faceit,
    steam,
    id
  } = formatParam(playerParam)

  return axios.get(`${process.env.API_URL}/api/ladder?faceit=${faceit}&steam=${steam}&id=${id}&region=${region}&country=${country}&game=${game}`)
    .then(res => res.data)
    .catch(e => {
      if (e.response.status === 404) return { position: 'N/A' }
      console.error(e.response.status, e.response.statusText, e.response.config.url)
      throw e.response.data.error
    })
}

const getStats = async ({
  playerParam,
  matchNumber = 20,
  checkElo = 1,
  map = '',
  startDate = '',
  endDate = '',
  game = ''
}) => {
  const {
    faceit,
    steam,
    id
  } = formatParam(playerParam)

  return axios.get(`${process.env.API_URL}/api/stats/${matchNumber}?faceit=${faceit}&steam=${steam}&id=${id}&checkElo=${checkElo}&map=${map}&startDate=${startDate}&endDate=${endDate}&game=${game}`)
    .then(res => res.data)
    .catch(e => {
      console.log(e)
      console.error(e.response.status, e.response.statusText, e.response.config.url)
      throw e.response.data.error
    })
}

const getFind = async ({
  playerParam,
  matchNumber = 0,
  checkElo = 1,
  map = '',
  startDate = '',
  endDate = '',
  faceitIncluded = [],
  steamIncluded = [],
  faceitExcluded = [],
  steamExcluded = [],
  game = ''
}) => {
  const {
    faceit,
    steam,
    id
  } = formatParam(playerParam)
  const faceitIncludedParam = faceitIncluded.join('&faceitIncluded=')
  const steamIncludedParam = steamIncluded.join('&steamIncluded=')
  const faceitExcludedParam = faceitExcluded.join('&faceitExcluded=')
  const steamExcludedParam = steamExcluded.join('&steamExcluded=')

  return axios.get(`${process.env.API_URL}/api/find?faceit=${faceit}&steam=${steam}&id=${id}&matchNumber=${matchNumber}&checkElo=${checkElo}&map=${map}&startDate=${startDate}&endDate=${endDate}&steamIncluded=${steamIncludedParam}&faceitIncluded=${faceitIncludedParam}&faceitExcluded=${faceitExcludedParam}&steamExcluded=${steamExcludedParam}&game=${game}`)
    .then(res => res.data)
    .catch(e => {
      console.error(e.response.status, e.response.statusText, e.response.config.url)
      throw e.response.data.error
    })
}

module.exports = {
  getStats,
  getFind,
  getLadder
}