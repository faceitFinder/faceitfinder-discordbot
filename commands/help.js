const { prefix, name } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')

const defaultFields = [
  { name: `\`${prefix}help\``, value: 'Show this list' },
  { name: `\`${prefix}help command\``, value: 'Show the command list' },
  { name: `\`${prefix}help system\``, value: 'Show the system command list' }]

const getCommandsHelp = (type, card) => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
  const commands = []

  for (const cf of commandFiles) commands.push(require(`./${cf}`))

  commands.forEach(c => {
    if (c.type === type) card.addFields({ name: `\`${prefix}${c.name}${c.options}\``, value: `${c.description}` })
  })
  
  if (card.fields && !card.title) card.setTitle(`Help ${type}:`)
  else if(!card.fields) card.addFields(defaultFields)

  return card
}

module.exports = {
  name: 'help',
  aliasses: ['help', 'h'],
  options: '',
  description: 'Display the command list.',
  type: 'system',
  execute(message, args) {
    const helpCard = new Discord.MessageEmbed().setFooter(`${name} Help`)

    if (!args.length) helpCard.setTitle('Command categories:').addFields(defaultFields)
    else helpCard.setDescription('Mandatory parameters: **[]**\nOptionnal parameters: **{}**')

    message.channel.send(getCommandsHelp(args[0], helpCard))
  }
}