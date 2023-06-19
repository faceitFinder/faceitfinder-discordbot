const GuildCustomRole = require('./database/guildCustomRole')
const GuildRoles = require('./database/guildRoles')
const { getRoleIds } = require('./functions/roles')
const { color } = require('./config.json')
const mongo = require('./database/mongo')

mongo().then(() => { console.info('🧱 Connected to mongo') }).catch(console.error)

GuildRoles.getAll()
  .then((guildRoles) =>
    guildRoles.forEach((roles) => {
      getRoleIds(roles)
        .forEach(async (roleId, i) =>
          GuildCustomRole.create(roles.id, roleId, color.levels[i + 1].min, color.levels[i + 1].max)
        )
    }))
  .then(() => console.info('✅ Roles updated'))
  .catch(console.error)
  .finally(() => process.exit(0))

