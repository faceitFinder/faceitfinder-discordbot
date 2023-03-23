const {maxLengthTeamName, invite, join} = require('../../config.json');
const base = structuredClone(require('../base'));
base.command.compare.description = 'Compare both user stats';
base.command.dailystats.description = 'Displays the stats of the chosen day, with elo graph of the day';
base.command.find.description = 'Find the games that includes the players requested (up to 5)';
base.command.help.description = 'Display the command list';
base.command.info.description = 'Get the info about the bot';
base.command.invite.description = 'Get the link to invite the bot on your server';
base.command.join.description = 'Get the link to join the community server of the bot';
base.command.last.description = 'Get the stats of last game';
base.command.laststats.description = 'Displays the stats of the x last match, with elo graph of the X last match';
base.command.link.description = 'Associer un profil faceit à un utilisateur discord, pour obtenir vos statistiques directement.';
base.command.map.description = 'Obtenir les statistiques de la map sélectionnée';
base.command.monthstats.description = 'Displays the stats of the chosen month, with elo graph of the month';
base.command.roles.description = 'Ranks are updated every hour and when you get your stats';
base.command.stats.description = 'Displays general stats, with elo graph of the 20 last games';
base.command.team.description = 'Create a team and link up to 5 users to it (limited to 1 team by discord account)';
base.command.unlink.description = 'Unlink your faceit id from the discord bot';
base.command.vote.description = 'Get the link to vote for the bot on top.gg';
base.command.weekstats.description = 'Displays the stats of the chosen week, with elo graph of the week';
base.command.yearstats.description = 'Displays the stats of the chosen year, with elo graph of the year';
base.options.matchNumber = 'Number of matches to display. Default: 20';
base.options.steamParameter = 'steamID / steamID personnalisé / url profil steam / @utilisateur / status CSGO.';
base.options.faceitParameter = 'pseudo faceit / @utilisateur / url profil faceit.';
base.options.steamParameters = 'steamIDs / steamIDs personnalisés / url profils steam / @utilisateurs / status CSGO.';
base.options.faceitParameters = 'pseudos faceit / @utilisateurs / url profils faceit.';
base.options.faceitParametersTeam = 'pseudos faceit / @utilisateurs / url profils faceit (Max 5).';
base.options.steamParametersTeam = 'steamIDs / steamIDs personnalisés / url profils steam / @utilisateurs / status CSGO (Max 5).';
base.options.teamParameter = 'slug d\'une équipe (vous devez en faire partie, être le créateur, ou que l\'équipe soit publique).';
base.options.fromDate = 'INCLUDED. Start date, format MM/DD/YYYY';
base.options.toDate = 'EXCLUS. Date de fin au format MM/JJ/AAAA, par défaut la date du jour, 1 jour d\'écart minimum.';
base.options.playerAimed = 'steam_parameter / faceit_parameter / @user / vide (pour vous-même si lié).';
base.options.globalUnlink = 'This will unlink your account on all servers (False by default)';
base.options.commandName = 'The name of one command';
base.options.mapName = 'Specify a map to get the stats related';
base.options.levelRoles = {
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3',
  4: 'Level 4',
  5: 'Level 5',
  6: 'Level 6',
  7: 'Level 7',
  8: 'Level 8',
  9: 'Level 9',
  10: 'Level 10'
};
base.options.removeOldRoles = 'Remove the old roles if they exist';
base.options.generateRoles = 'Generates the rank roles on the server';
base.options.setupRoles = 'Setup the roles that you want for each ranks on the server';
base.options.removeRoles = 'Removes the rank roles on the server';
base.options.infoTeam = 'Get information about your teams';
base.options.createTeam = 'Create your team';
base.options.deleteTeam = 'Delete your team';
base.options.addUserTeam = 'Add a user to your team';
base.options.updateTeam = 'Update your team';
base.options.removeUserTeam = 'Remove a user from your team';
base.options.nameTeam = `Nom de l'équipe, ${ maxLengthTeamName } characters`;
base.options.accessTeam = 'Allow every discord users to show your team statistics';
base.options.excludedSteamParameters = 'Exclure des joueurs de la recherche. (steam_parameters)';
base.options.excludedFaceitParameters = 'Exclure des joueurs de la recherche. (faceit_parameters)';
base.options.discordUserLink = 'Link the user only for this server (Role management permissions to link someone else)';
base.options.nicknameLink = 'Mettre à jour le pseudo discord avec le pseudo faceit. (Fonctionne uniquement si non admin)';
base.strings.selectTeam = 'Select a team';
base.strings.infoTeam = 'Get info about the team {teamName}';
base.strings.voteDescription = 'Hey {discord} tu peux m\'aider à grandir en votant pour moi sur top.gg !';
base.strings.messageProcessing = 'Your request is currently processing...';
base.strings.error = 'Error';
base.strings.info = 'Info';
base.strings.compare = 'Comparison between {playerName1} and {playerName2}';
base.strings.matchPlayed = '{matchNumber} matches played';
base.strings.selectDate = 'Select a date';
base.strings.helpInfo = 'Information about the {command} command \n `<>`: Optional, `[]`: Required, `{}`: Required if not linked';
base.strings.noOptions = 'This command does not require any options';
base.strings.commands = 'Commands';
base.strings.help = 'Help';
base.strings.helpDescription = '/help <command> for more info on a specific command';
base.strings.stats = 'Stats';
base.strings.system = 'System';
base.strings.utility = 'Utility';
base.strings.description = 'Description';
base.strings.options = 'Options';
base.strings.usage = 'Usage';
base.strings.example = 'Example';
base.strings.creator = 'Creator';
base.strings.invitationLink = 'Invitation link';
base.strings.voteLink = 'Vote link';
base.strings.serverLink = 'Server link';
base.strings.accountLinked = 'Account linked';
base.strings.invite = 'Invite';
base.strings.inviteDescription = `Hey {discord} tu peux m\'inviter sur ton serveur en cliquant sur le lien ci-dessous !\n ${ invite }`;
base.strings.join = 'Join';
base.strings.joinDescription = `Hey {discord} tu peux rejoindre le serveur de support en cliquant sur le lien ci-dessous !\n ${ join }`;
base.strings.selectMatchBelow = 'Select one of the matches below';
base.strings.lastMatchLabel = 'Last match stats info';
base.strings.lastMatchDescription = 'Info about the last match';
base.strings.selectAnotherMatch = 'Select another match';
base.strings.lastStatsLabel = 'Statistics of the last matches';
base.strings.selectMap = 'Select a map';
base.strings.selectMapDescription = 'Select one of the following maps to get the statistics related ({playerName})';
base.strings.selectWeek = 'Select a week';
base.strings.year = 'Year';
base.strings.selectYear = 'Select a year';
base.strings.loading = 'Loading';
base.strings.pagination = {
  prev: 'Previous Page',
  next: 'Next Page',
  first: 'First Page',
  last: 'Last Page'
};
base.error.user.missing = 'It seems like there is a user missing';
base.error.user.compareSame = 'You can\'t compare the same user';
base.error.user.excluded = 'You can\'t exclude a player you are searching for';
base.error.user.teamOwn = 'You don\'t own a team';
base.error.user.noTeam = 'You don\'t own a team and you aren\'t part of any team';
base.error.user.teamFull = 'You can\'t add more than 5 users to your team';
base.error.user.alreadyInTeam = '**{playerName}** is already part of the team **{teamName}**';
base.error.user.notInTeam = '**{playerName}** is not part of the team **{teamName}**';
base.error.user.permissions = { manageRoles: 'You don\'t have the permission to manage roles' };
base.error.user.notLinked = '{discord} is not linked to any faceit account';
base.error.user.noParametersNoLink = 'Merci de renseigner un utilisateur ou une équipe.\nVous pouvez également lier votre compte discord à votre compte faceit afin d\'obtenir vos statistiques directement.\nPour plus d\'informations, tapez la commande `/help command: link`.';
base.error.user.noMatches = 'Couldn\'t find any matches for the player **{playerName}**';
base.error.user.lastMatchNoStats = 'Couldn\'t find any stats for the last match of the player **{playerName}**';
base.error.user.noMatchFoundWithOthers = 'Couldn\'t find any matches where **{playerName}** played with the requested players';
base.error.user.noBotLink = 'Sorry, but bots aren\'t really my type';
base.error.user.globalLink = '{discord} already has a global link';
base.error.user.notFound = 'The requested user is not on this server';
base.error.execution.command = 'An error occurred while executing the command';
base.error.execution.selectmenu = 'An error occurred while executing the select menu';
base.error.execution.button = 'An error occurred while executing the button';
base.error.execution.contextmenu = 'An error occurred while executing the context menu';
base.error.bot.channelNotAccessible = 'I do not have the permission to send messages in this channel';
base.error.bot.messageEvent = 'Please use the slash commands (/)';
base.error.bot.manageRoles = 'I don\'t have the permission to manage roles';
base.error.command.notFound = 'Command not found';
base.error.command.teamNameAlreadyExist = 'A team with this name already exists';
base.error.command.teamNameTooLong = `The team name is too long, it must be under ${ maxLengthTeamName } characters`;
base.error.command.alreadyOwnTeam = 'You already own the team **{teamName}**';
base.error.command.invalidRoles = 'One or more roles are invalid';
base.error.command.roleTooHigh = 'This role is higher than the bot role, please place it below the bot role';
base.error.command.teamNotFound = 'This team doesn\'t exist';
base.error.command.teamEmpty = 'This team doesn\'t have any members';
base.error.command.teamNoAccess = 'You don\'t have access to this team';
base.success.command.removeRoles = 'The roles have been removed successfully';
base.success.command.generateRoles = 'The roles have been generated successfully';
base.success.command.setupRoles = 'The roles have been setup successfully';
base.success.command.removeTeam = 'Your team **{teamName}** has been removed successfully';
base.success.command.updateTeam = 'Your team **{teamName}** has been updated';
base.success.command.createTeam = 'Your team **{teamName}** has been created';
base.success.command.removeUser = '**{playerName}** has been removed from the team **{teamName}**';
base.success.command.addUser = '**{playerName}** has been added to the team **{teamName}**';
base.success.command.unlink = {
  global: 'Your account has been unlinked successfully',
  server: 'Your account has been unlinked successfully on this server'
};
base.success.command.link = '{discord} has been linked to **{playerName}**';
module.exports = base;