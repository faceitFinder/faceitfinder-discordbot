const axios = require('axios')

require('dotenv').config()

const headerFaceit = {
  Authorization: `Bearer ${process.env.FACEIT_TOKEN}`
}

const fetchData = async (url, error) => axios.get(url, {
  headers: headerFaceit
})
  .then(res => {
    if (res.status == 200) return res.data
    else {
      console.error(res.statusText, res.url)
      throw error
    }
  })
  .then(data => data)

module.exports = {
  fetchData
}