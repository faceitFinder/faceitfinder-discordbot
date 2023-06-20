const GuildCustomRole = require('./database/guildCustomRole')
const GuildRoles = require('./database/guildRoles')
const { getRoleIds } = require('./functions/roles')
const { color } = require('./config.json')
const mongo = require('./database/mongo')

mongo().then(() => { console.info('🧱 Connected to mongo') }).catch(console.error)


GuildRoles.getAll().then(async (guildRoles) => {
  for (let i = 0; i < guildRoles.length; i++) {
    const guildRole = guildRoles[i]

    getRoleIds(guildRole).forEach(async (roleId, i) => {
      if (await GuildCustomRole.getOne(guildRole.id, roleId)) {
        console.info(`⚠️ Role ${roleId} already exists for guild ${guildRole.id}`)
        return
      }

      GuildCustomRole.create(guildRole.id, roleId, color.levels[i + 1].min, color.levels[i + 1].max)
      console.info(`✅ Created role ${roleId} for guild ${guildRole.id}`)
    })
  }
})
