const { prefix, name, color } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')

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

  return card
}

const getCommandsHelp = (commandName, card) => {
  try {
    command = require(`./${commandName}.js`)
  } catch {
    return new Discord.MessageEmbed()
      .setColor(color.error)
      .setDescription('**Command not found**')
      .setFooter(`${name} Error`)
  }

  card.setDescription(`Informations about the ${command.name} command\n{}: Optionnal parameters\n<>: Mandatory parameters`)
    .addFields({ name: 'Aliases', value: `${command.aliasses.join(',')}` },
      { name: 'Description', value: `${command.description}` },
      { name: 'Options', value: `${command.options ? command.options : 'This command do not required options'}` },
      { name: 'Usage', value: `${prefix}${command.name} ${command.options ? command.options : ''}` })

  return card
}

module.exports = {
  name: 'help',
  aliasses: ['help', 'h'],
  options: '{command}',
  description: 'Display the command list.',
  type: 'system',
  execute(message, args, client) {
    const helpCard = new Discord.MessageEmbed()
      .setColor(color.primary)
      .setTitle('Commands')
      .setDescription(`\`${prefix}help {command}\` for more info on a specific command`)
      .setFooter(`${name} Help`)

    if (args.length === 0) message.channel.send({
      embeds: [
        getCommands(helpCard)
      ]
    })
    else message.channel.send({
      embeds: [
        getCommandsHelp(args[0], helpCard)
      ]
    })
  }
}