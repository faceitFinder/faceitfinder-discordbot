const stats = [
  {
    name: 'steam_parameters',
    description: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'team',
    description: 'team slug (you need to be a part of it, the creator, or it has to be public)',
    required: false,
    type: 3,
    slash: true
  },
  {
    name: 'faceit_parameters',
    description: 'faceit nicknames (case sensitive) / @users',
    required: false,
    type: 3,
    slash: true
  }
]

module.exports = {
  stats
}