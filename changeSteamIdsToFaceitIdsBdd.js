const mongo = require('./database/mongo')
const User = require('./database/user')
const UserTeam = require('./database/userTeam')
const Player = require('./functions/player')

mongo()
  .then(() => { console.info('🧱 Connected to mongo') })
  .then(async () => {
    console.info('Users')

    User.getAll().then(users => {
      users.forEach(async user => {
        if (!user.steamId || user.faceitId) return
        const faceitId = await Player.getId(user.steamId).catch(console.error)
        User.update(user.discordId, faceitId)
        console.info('done')
      })
    })

    console.info('Team Users')

    UserTeam.getAll().then(users => {
      users.forEach(async user => {
        if (!user.steamId || user.faceitId) return
        const faceitId = await Player.getId(user.steamId).catch(console.error)
        UserTeam.updateOne(user.steamId, faceitId)
        console.info('done')
      })
    })
  })
  .catch(console.error)