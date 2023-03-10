const axios = require('axios')

require('dotenv').config()

const headerFaceit = {
  Authorization: `Bearer ${process.env.FACEIT_TOKEN}`
}

const fetchData = async (url, error) => axios.get(url, {
  headers: headerFaceit
})
  .then(res => res.data)
  .catch(e => {
    console.error(e.response.status, e.response.statusText, url)
    if (e.response.status === 500) throw 'Faceit: internal server error.'
    throw error
  })

module.exports = {
  fetchData
}