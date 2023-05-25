const { startBot, client } = require('../bot.js')

startBot()

const faceitNickname = [
  'IDams_',
  'ZywOo',
  'apEX',
  'dupreeh',
  'Mag1sk-',
  'Spinx',
  'Sheraw',
  'Kyojin',
  'shox',
  'Misutaa'
]
const steamIds = [
  '76561197978074110',
  '76561198874549934',
  '76561198303109991',
  '76561198153371146',
  '76561198066119037',
  '76561198446898398',
  '76561198348083954',
  '76561198047934607',
  '76561198050022064',
  '76561198811669045'
]

client.once('ready', async c => {
  let interaction = await interactionBuilder({
    client,
    applicationId: applicationId,
    guildId: guildId,
    channelId: channelId,
    userId: userId,
  })

  const opts = await optionsBuilder({
    client,
    guildId: guildId,
    options: [client.commands.get('stats').options.map(opt => opt.name)]
  })

  const modifybalReply = async (resp) => console.log('modifybalReply', JSON.stringify(resp))
  const modifybalDeferReply = async (resp) => console.log('modifybalDeferReply', JSON.stringify(resp))
  const modifybalEditReply = async (resp) => console.log('modifybalEditReply', JSON.stringify(resp))
  const modifybalFollowUp = async (resp) => console.log('modifybalFollowUp', JSON.stringify(resp))
  const modifybalDeleteReply = async (resp) => console.log('modifybalDeleteReply', JSON.stringify(resp))

  const modifybal = interaction({
    type: 'APPLICATION_COMMAND',
    name: 'stats',
    commandId: '1234',
    reply: modifybalReply,
    deferReply: modifybalDeferReply,
    editReply: modifybalEditReply,
    followUp: modifybalFollowUp,
    deleteReply: modifybalDeleteReply,
    options: [
      await opts.build({ id: 'bun', name: 'user' }),
      await opts.build({ id: 'int', name: 'amount', value: 1000 })
    ]
  })

  client.emit('interactionCreate', modifybal)
})