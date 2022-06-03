const mongo = require('./database/mongo')
const User = require('./database/user')
const UserTeam = require('./database/userTeam')
const Player = require('./functions/player')

mongo()
  .then(() => { console.log('🧱 Connected to mongo') })
  .then(async () => {
    console.log('Users')

    User.getAll().then(users => {
      users.forEach(async user => {
        if (!user.steamId || user.faceitId) return
        const faceitId = await Player.getId(user.steamId).catch(console.error)
        User.update(user.discordId, faceitId)
        console.log('done')
      })
    })

    console.log('Team Users')

    UserTeam.getAll().then(users => {
      users.forEach(async user => {
        if (!user.steamId || user.faceitId) return
        const faceitId = await Player.getId(user.steamId).catch(console.error)
        UserTeam.updateOne(user.steamId, faceitId)
        console.log('done')
      })
    })
  })
  .catch(console.error)