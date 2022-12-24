const CommandsStats = require('./models/commandsStatsModel')

const create = (commandName, commandType, date) => {
  const newCommandStats = new CommandsStats({
    commandName: commandName,
    commandType: commandType,
    date: date
  })

  newCommandStats.save((err) => {
    if (err) console.error(err)
  })
}

module.exports = {
  create
}