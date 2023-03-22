const { name, color } = require('../config.json')
const Discord = require('discord.js')
const fs = require('fs')
const errorCard = require('../templates/errorCard')
const { getInteractionOption } = require('../functions/commands')
const { getTranslations, getTranslation } = require('../languages/setup')

const getCommandsList = () => {
  return fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js') && !file.startsWith('help'))
    .map(cf => require(`./${cf}`))
}

const getCommands = (card, lang) => {
  const commands = getCommandsList()
  const types = [...new Set(commands.map(c => c.type))]

  types.forEach(t => {
    let value = ''
    commands.forEach(c => { if (c.type === t) value += `\`${c.name}\` ` })
    card.addFields({ name: getTranslation(`strings.${t}`, lang), value: value })
  })

  return { embeds: [card] }
}

const getCommandsHelp = (commandName, card, lang) => {
  try { command = require(`./${commandName}.js`) }
  catch {
    return errorCard(getTranslation('error.command.notFound', lang, {
      command: commandName
    }), lang)
  }

  let optionsDesc = ''

  command.options.forEach(o => {
    let desc = o.descriptionLocalizations[lang] || o.description
    if (desc) optionsDesc += `\`${o.name}\`: ${desc}\n`
  })

  card.setDescription(getTranslation('strings.helpInfo', lang, {
    command: command.name
  }))
    .addFields({ name: getTranslation('strings.description', lang), value: command.descriptionLocalizations[lang] || command.description },
      { name: getTranslation('strings.options', lang), value: optionsDesc.length > 0 ? optionsDesc : getTranslation('strings.noOptions', lang) },
      { name: getTranslation('strings.usage', lang), value: `\`/${command.name} ${command.usage}\`` })

  if (command?.example) card.addFields({ name: getTranslation('strings.example', lang), value: `\`/${command.name} ${command.example}\`` })

  return { embeds: [card] }
}

module.exports = {
  name: 'help',
  options: [
    {
      name: 'command',
      description: getTranslation('options.commandName', 'en-US'),
      descriptionLocalizations: getTranslations('options.commandName'),
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
  description: getTranslation('command.help.description', 'en-US'),
  descriptionLocalizations: getTranslations('command.help.description'),
  usage: '<command>',
  type: 'system',
  async execute(interaction) {
    const command = getInteractionOption(interaction, 'command')?.trim().split(' ')[0]

    const helpCard = new Discord.EmbedBuilder()
      .setColor(color.primary)
      .setTitle(getTranslation('strings.help', interaction.locale))
      .setDescription(getTranslation('strings.helpDescription', interaction.locale))
      .setFooter({ text: `${name} ${getTranslation('strings.help', interaction.locale)}` })

    if (command) return getCommandsHelp(command, helpCard, interaction.locale)
    else return getCommands(helpCard, interaction.locale)
  }
}
