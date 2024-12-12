const CommandsStats = require('./models/commandsStatsModel')

const create = (commandName, commandType, { createdAt, locale }) => {
  const newCommandStats = new CommandsStats({
    commandName: commandName,
    commandType: commandType,
    locale: locale,
    date: createdAt
  })

  newCommandStats.save()
}

module.exports = {
  create
}