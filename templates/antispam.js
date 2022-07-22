module.exports = class AntiSpam {
  constructor(
    msgInARow = 3,
    maxInterval = 2500,
    warnMessage = 'slow down please.',
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

      if (createdAt - newPlayer.lastMessageDate < this.maxInterval) {
        newPlayer.messageCount += 1
        if (newPlayer.messageCount > this.msgInARow) {
          this.playersIgnored.set(userId, true)
          channel.send(`<@${userId}> your messages will not be executed during the following ${this.timeIgnored / 1000}s`)

          setTimeout(() => {
            this.playersIgnored.delete(userId)
            this.players.delete(userId)
          }, this.timeIgnored)

          ignored = true
        } else if (newPlayer.messageCount === this.msgInARow) {
          channel.send(`<@${userId}> ${this.warnMessage}`)
          ignored = false
        }
      } else {
        newPlayer.messageCount = 1
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