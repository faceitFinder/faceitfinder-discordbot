const { prefix, name, color } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const errorCard = require('../templates/errorCard')

const getCommands = (card) => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
  const commands = []
  const types = []

  commandFiles.forEach(cf => commands.push(require(`./${cf}`)))
  commands.forEach(c => { if (!types.includes(c.type)) types.push(c.type) })
  types.forEach(t => {
    let value = ''
    commands.forEach(c => { if (c.type === t) value += `\`${prefix} ${c.name}\` ` })
    card.addField(t, value)
  })

  return { embeds: [card] }
}

const getCommandsHelp = (commandName, card) => {
  try { command = require(`./${commandName}.js`) }
  catch { return errorCard('**Command not found**') }

  let optionsDesc = ''

  command.options.forEach(o => { optionsDesc += `\`${o.name}\`: ${o.description}\n` })

  card.setDescription(`Informations about the ${command.name} command`)
    .addFields({ name: 'Aliases', value: `${command.aliasses.join(',')}` },
      { name: 'Description', value: `${command.description}` },
      { name: 'Options', value: `${optionsDesc.length > 0 ? optionsDesc : 'This command do not required options'}` },
      { name: 'Usage', value: `${prefix}${command.name} ${command.usage}` })

  return { embeds: [card] }
}

module.exports = {
  name: 'help',
  aliasses: ['help', 'h'],
  options: [
    {
      name: 'command',
      description: 'One of the command name.',
      required: false,
      type: 3
    }
  ],
  description: 'Display the command list.',
  usage: 'command name',
  type: 'system',
  execute(message, args) {
    const helpCard = new Discord.MessageEmbed()
      .setColor(color.primary)
      .setTitle('Commands')
      .setDescription(`\`${prefix}help {command}\` for more info on a specific command`)
      .setFooter(`${name} Help`)

    if (args.length === 0) return getCommands(helpCard)
    else return getCommandsHelp(args[0], helpCard)
  }
}