const { sendCardWithInfos } = require("../../commands/last")

module.exports = {
  name: 'lastSelector',
  async execute(interaction) {
    const { u, m, s } = JSON.parse(interaction.values)
    if (u !== interaction.user.id) return false

    return sendCardWithInfos({ author: interaction.user }, s, m)
  }
}