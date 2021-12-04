const { Api } = require('@top-gg/sdk')
const { prefix } = require('../config.json')

const guildCount = (client) => {
  const Guilds = client.guilds.cache.map(guild => guild.id)
  client.user.setActivity(`${prefix}help | ${Guilds.length} servers`, { type: 'PLAYING' })

  // Send datas to top.gg
  if (process.env.TOPGG_TOKEN) {
    const api = new Api(process.env.TOPGG_TOKEN)
    api.postStats({
      serverCount: Guilds.length
    }).catch(e => console.log(e))
  }

}

module.exports = {
  guildCount,
}