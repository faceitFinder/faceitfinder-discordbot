const errorCard = require('../templates/errorCard')

module.exports = class AntiSpam {
  constructor(
    msgInARow = 3,
    maxInterval = 2500,
    warnMessage = 'Slow down please :)',
    timeIgnored = 10000,
    playersIgnored = new Map(),
    players = new Map()) {
    this.msgInARow = msgInARow
    this.maxInterval = maxInterval
    this.timeIgnored = timeIgnored
    this.warnMessage = warnMessage
    this.playersIgnored = playersIgnored
    this.players = players
  }

  isIgnored(userId, createdAt, channel) {
    if (this.playersIgnored.has(userId)) return true
    else if (this.players.has(userId)) {
      let ignored = false
      const newPlayer = this.players.get(userId)
      newPlayer.messageCount += 1

      if (createdAt - newPlayer.lastMessageDate < this.maxInterval
        && newPlayer.messageCount >= this.msgInARow)
        if (newPlayer.messageCount > this.msgInARow) {
          this.playersIgnored.set(userId, true)
          channel.send(errorCard(`<@${userId}> your messages will not be executed during the following ${this.timeIgnored / 1000}s`))

          setTimeout(() => {
            this.playersIgnored.delete(userId)
            this.players.delete(userId)
          }, this.timeIgnored)

          ignored = true
        } else {
          channel.send(errorCard(this.warnMessage))
          ignored = false
        }

      newPlayer.lastMessageDate = createdAt
      this.players.set(userId, newPlayer)

      return ignored
    } else {
      this.players.set(userId, {
        messageCount: 1,
        lastMessageDate: createdAt,
      })
      return false
    }
  }
}