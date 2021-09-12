module.exports = (client, guildId) => {
  const app = client.api.applications(client.user.id)
  if (guildId) app.guilds(guildId)
  return app
}