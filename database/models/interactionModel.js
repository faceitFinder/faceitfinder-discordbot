const mongoose = require('mongoose')

// 5 minutes
const expiresAfter = 5 * 60

const interactionSchema = mongoose.Schema({
  discordId: String,
  jsonData: Object,
  createdAt: Date,
  updatedAt: { type: Date, expires: expiresAfter },
})

module.exports = mongoose.model('interaction', interactionSchema)