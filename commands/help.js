const { name, color } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const errorCard = require('../templates/errorCard')
const { getInteractionOption } = require('../functions/commands')

const getCommandsList = () => {
  return fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js') && !file.startsWith('help'))
    .map(cf => require(`./${cf}`))
}

const getCommands = (card) => {
  const commands = getCommandsList()
  const types = [...new Set(commands.map(c => c.type))]

  types.forEach(t => {
    let value = ''
    commands.forEach(c => { if (c.type === t) value += `\`${c.name}\` ` })
    card.addFields({ name: t, value: value })
  })

  return { embeds: [card] }
}

const getCommandsHelp = (commandName, card) => {
  try { command = require(`./${commandName}.js`) }
  catch { return errorCard('Command not found') }

  let optionsDesc = ''

  command.options.forEach(o => { if (o.description) optionsDesc += `\`${o.name}\`: ${o.description}\n` })

  card.setDescription(`Information about the ${command.name} command \n \`<>\`: optional, \`[]\`: required, \`{}\`: required if not linked`)
    .addFields({ name: 'Description', value: command.description },
      { name: 'Options', value: optionsDesc.length > 0 ? optionsDesc : 'This command does not require any options' },
      { name: 'Usage', value: `\`/${command.name} ${command.usage}\`` })

  if (command?.example) card.addFields({ name: 'Example', value: `\`/${command.name} ${command.example}\`` })

  return { embeds: [card] }
}

module.exports = {
  name: 'help',
  options: [
    {
      name: 'command',
      description: 'One of the command name.',
      required: false,
      type: Discord.ApplicationCommandOptionType.String,
      slash: true,
      choices: [
        ...getCommandsList().map(c => {
          if (c?.name) return { name: c.name, value: c.name }
        }).filter(c => c !== undefined)
      ]
    }
  ],
  description: 'Display the command list.',
  usage: 'command name',
  type: 'system',
  async execute(interaction) {
    const command = getInteractionOption(interaction, 'command')?.trim().split(' ')[0]

    const helpCard = new Discord.EmbedBuilder()
      .setColor(color.primary)
      .setTitle('Commands')
      .setDescription('`/help {command}` for more info on a specific command')
      .setFooter({ text: `${name} Help` })

    if (command) return getCommandsHelp(command, helpCard)
    else return getCommands(helpCard)
  }
}
