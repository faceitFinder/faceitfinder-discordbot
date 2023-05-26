const { ShardingManager } = require('discord.js')

const manager = new ShardingManager('./bot.js', { token: process.env.TOKEN })

manager.on('shardCreate', shard => console.info(`Launched shard ${shard.id}`))

manager.spawn()