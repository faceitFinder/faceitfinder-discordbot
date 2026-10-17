const axios = require('axios')
const axiosRetry = require('axios-retry').default
const { defaultMatchNumber } = require('../config.json')

axiosRetry(axios, { retries: 3 })

const API_ERROR = 'error.execution.command'

const formatParam = (playerParam) => {
  return {
    faceit: !playerParam.steam && !playerParam.faceitId ? playerParam.param : '',
    steam: playerParam.steam ? playerParam.param : '',
    id: playerParam.faceitId ? playerParam.param : ''
  }
}

// Values typed by users (nicknames, steam links...) must stay inside their query parameter
const toQuery = (params) => new URLSearchParams(
  Object.entries(params).flatMap(([key, value]) => [value].flat().map(v => [key, v ?? '']))
).toString()

// e.response is undefined when the API cannot be reached (container down, timeout...)
const handleError = (e) => {
  console.error(e.response?.status ?? e.code, e.response?.statusText ?? e.message, e.config?.url)
  throw e.response?.data?.error ?? API_ERROR
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

  return axios.get(`${process.env.API_URL}/api/ladder?${toQuery({ faceit, steam, id, region, country, game })}`)
    .then(res => res.data)
    .catch(e => {
      if (!e.response || e.response.status === 404) return { position: 'N/A' }
      return handleError(e)
    })
}

const getStats = async ({
  playerParam,
  matchNumber = defaultMatchNumber,
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

  return axios.get(`${process.env.API_URL}/api/stats/${encodeURIComponent(matchNumber)}?${toQuery({ faceit, steam, id, checkElo, map, startDate, endDate, game })}`)
    .then(res => res.data)
    .catch(handleError)
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

  return axios.get(`${process.env.API_URL}/api/find?${toQuery({
    faceit,
    steam,
    id,
    matchNumber,
    checkElo,
    map,
    startDate,
    endDate,
    steamIncluded,
    faceitIncluded,
    faceitExcluded,
    steamExcluded,
    game
  })}`)
    .then(res => res.data)
    .catch(handleError)
}

const getMatch = async ({
  playerParam,
  matchId
}) => {
  const {
    faceit,
    steam,
    id
  } = formatParam(playerParam)
  return axios.get(`${process.env.API_URL}/api/match/${encodeURIComponent(matchId)}?${toQuery({ faceit, steam, id })}`)
    .then(res => res.data)
    .catch(handleError)
}

const getSeasons = async (
  game = ''
) => {
  const response = axios.get(`${process.env.API_URL}/api/seasons?${toQuery({ game })}`)
    .then(res => res.data)
    .catch(handleError)
  return response
}

module.exports = {
  getStats,
  getFind,
  getLadder,
  getMatch,
  getSeasons,
}
