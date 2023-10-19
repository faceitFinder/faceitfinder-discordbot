const mongoose = require('mongoose')

const interactionSchema = mongoose.Schema({
  discordId: String,
  jsonData: Object,
  createdAt: Date,
  updatedAt: Date,
})

module.exports = mongoose.model('interaction', interactionSchema)