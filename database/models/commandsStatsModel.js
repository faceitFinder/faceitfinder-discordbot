const mongoose = require('mongoose')

const commandsStatsSchema = mongoose.Schema({
  commandName: String,
  commandType: String,
  locale: String,
  date: Date,
})

module.exports = mongoose.model('commandsStats', commandsStatsSchema)