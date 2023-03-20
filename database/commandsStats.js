const CommandsStats = require('./models/commandsStatsModel')

const create = (commandName, commandType, date) => {
  const newCommandStats = new CommandsStats({
    commandName: commandName,
    commandType: commandType,
    date: date
  })

  newCommandStats.save()
}

module.exports = {
  create
}