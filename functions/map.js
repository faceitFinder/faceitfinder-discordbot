const getMapList = () => {
  return [
    {
      name: 'Dust 2',
      value: 'de_dust2'
    },
    {
      name: 'Inferno',
      value: 'de_inferno'
    },
    {
      name: 'Mirage',
      value: 'de_mirage'
    },
    {
      name: 'Nuke',
      value: 'de_nuke'
    },
    {
      name: 'Overpass',
      value: 'de_overpass'
    },
    {
      name: 'Train',
      value: 'de_train'
    },
    {
      name: 'Vertigo',
      value: 'de_vertigo'
    },
    {
      name: 'Cache',
      value: 'de_cache'
    },
    {
      name: 'Cobblestone',
      value: 'de_cbble'
    },
    {
      name: 'Ancient',
      value: 'de_ancient'
    }
  ]
}

const getMapChoice = () => [
  ...getMapList().map(c => {
    if (c?.name) return { name: c.name, value: c.value }
  }).filter(c => c !== undefined)
]

module.exports = {
  getMapList,
  getMapChoice
}