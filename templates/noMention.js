module.exports = msg => {
  return {
    ...msg,
    allowedMentions: {
      repliedUser: false
    }
  }
}