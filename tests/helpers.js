const path = require('node:path')

const root = path.resolve(__dirname, '..')

/**
 * Replace a module of the bot by a stub, before the code under test requires it.
 * node --test runs every test file in its own process, so stubs never leak between files.
 */
const stubModule = (relativePath, exports) => {
  const filename = require.resolve(path.join(root, relativePath))
  require.cache[filename] = { id: filename, filename, loaded: true, exports }
  return exports
}

const load = (relativePath) => require(path.join(root, relativePath))

/**
 * Minimal chat input interaction, shaped like the discord.js objects the bot reads
 * (options._hoistedOptions / options._subcommand).
 */
const fakeInteraction = ({ options = {}, subcommand, userId = 'user-1', guildId = 'guild-1', extra = {} } = {}) => ({
  locale: 'en-US',
  commandName: 'test',
  user: { id: userId },
  guild: { id: guildId },
  guildId,
  options: {
    _subcommand: subcommand,
    _hoistedOptions: Object.entries(options).map(([name, value]) => ({ name, value })),
  },
  ...extra,
})

const flush = () => new Promise(resolve => setTimeout(resolve, 50))

module.exports = {
  stubModule,
  load,
  fakeInteraction,
  flush,
}
