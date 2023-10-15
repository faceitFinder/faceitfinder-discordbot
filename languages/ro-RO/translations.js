/* eslint-disable semi */
const {maxLengthTeamName, invite, join} = require('../../config.json');
const base = structuredClone(require('../base'));
base.command.compare.description = 'Compara statisticile a doi jucători';
base.command.dailystats.description = 'Vezi statisticile unei zile, cu graficul elo al zilei';
base.command.find.description = 'Află care dintre ultimele 1000 de jocuri includ jucătorii solicitați (până la 5)';
base.command.help.description = 'Afișează lista de comenzi';
base.command.info.description = 'Vezi informații despre bot';
base.command.invite.description = 'Obțineți linkul pentru a invita botul pe serverul dvs.';
base.command.join.description = 'Obțineți link-ul pentru a vă alătura serverului comunitar al botului';
base.command.last.description = 'Get the stats of last game';
base.command.laststats.description = 'Displays the stats of the x last match, with elo graph of the X last match';
base.command.link.description = 'Link a faceit profile to the discord user, to get your stats directly (no parameters needed)';
base.command.map.description = 'Displays the stats of the chosen map';
base.command.monthstats.description = 'Displays the stats of the chosen month, with elo graph of the month';
base.command.roles.description = 'Ranks are updated every hour and when you get your stats';
base.command.stats.description = 'Displays general stats, with elo graph of the 20 last games';
base.command.team.description = 'Create a team and link up to 5 users to it (limited to 1 team by discord account)';
base.command.unlink.description = 'Unlink your faceit id from the discord bot';
base.command.vote.description = 'Get the link to vote for the bot on top.gg';
base.command.weekstats.description = 'Afișează statisticile săptămânii alese, cu graficul elo al săptămânii';
base.command.yearstats.description = 'Afișează statisticile din anul ales, cu graficul elo al anului.';
base.options.matchNumber = 'Numărul de meciuri care trebuie afișate. Implicit: {default}';
base.options.steamParameter = 'steamID / steam custom ID / steam profile url / @user / CSGO status';
base.options.faceitParameter = 'faceit nickname / @user / faceit profile url';
base.options.steamParameters = 'steamIDs / steam custom IDs / steam profile urls / @users / CSGO status';
base.options.faceitParameters = 'faceit nicknames / @users / faceit profile urls';
base.options.faceitParametersTeam = 'faceit nicknames / @users / faceit profile urls (Max 5)';
base.options.steamParametersTeam = 'steamIDs / steam custom IDs / steam profile urls / @users / CSGO status (Max 5)';
base.options.teamParameter = 'team slug (trebuie să faci parte din ea, să fii creatorul ei, sau să fie publică)';
base.options.fromDate = 'INCLUSE. Data de începere, format MM/DD/AAAA';
base.options.toDate = 'EXCLUSE. Data de sfârșit (minim o zi interval), dacă este goală se ia ziua curentă Format MM/DD/AAAA';
base.options.playerAimed = 'steam_parameters / faceit_parameters / @user / empty if linked';
base.options.globalUnlink = 'Vei primi unlink pe toate serverele (Fals ca implicit)';
base.options.commandName = 'Numele comenzii';
base.options.mapName = 'Specifica o hartă pentru a-ți vedea statisticile pe ea';
base.options.levelRoles = {
  1: 'Nivel 1',
  2: 'Nivel 2',
  3: 'Nivel 3',
  4: 'Nivel 4',
  5: 'Nivel 5',
  6: 'Nivel 6',
  7: 'Nivel 7',
  8: 'Nivel 8',
  9: 'Nivel 9',
  10: 'Nivel 10'
};
base.options.removeOldRoles = 'Scoate rolurile vechi daca exista';
base.options.generateRoles = 'Genereaza rolurile pe server';
base.options.setupRoles = 'Configurați rolurile pe care le doriți pentru fiecare rang de pe server';
base.options.removeRoles = 'Îndepărtează rolurile de rang de pe server';
base.options.infoTeam = 'Vezi informații despre echipa ta';
base.options.createTeam = 'Fa-ți o echipa';
base.options.deleteTeam = 'Șterge-ți echipa';
base.options.addUserTeam = 'Adaugă un utilizator in echipa ta';
base.options.updateTeam = 'Actualizează-ți echipa';
base.options.removeUserTeam = 'Scoate un membru din echipa ta';
base.options.nameTeam = `numele echipei tale, pana la ${ maxLengthTeamName } caractere`;
base.options.accessTeam = 'Permiteți fiecărui utilizator discord să arate statisticile echipei dvs.';
base.options.excludedSteamParameters = 'Excludeți parametrii steam din căutare';
base.options.excludedFaceitParameters = 'Excludeți parametrii faceit din căutare';
base.options.discordUserLink = 'Conectați utilizatorul doar pentru acest server, permisiuni gestionare roluri pentru legătura altora';
base.options.nicknameLink = 'Makes your discord nickname the same as your faceit nickname (Only works with non admin users)';
base.options.eloRoleName = 'Numele care se atribuie acestui rol';
base.options.eloRoleColor = 'Culoarea care se atribuie acestui rol (HEX, de exemplu: #FF0000)';
base.options.eloRoleMin = 'Elo minim necesar pentru acest rol (inclus)';
base.options.eloRoleMax = 'Elo maxim necesar pentru acest rol (inclus)';
base.options.setupEloRoles = 'Generează un rol care va fi atribuit utilizatorilor în funcție de intervalul elo pe care l-ați setat';
base.options.removeEloRole = 'Ștergeți rolul selectat';
base.options.eloRole = '@rol';
base.options.gameParameter = 'Jocul de la care se obțin statisticile (implicit: CS2)';
base.strings.selectTeam = 'Selectează o echipa';
base.strings.infoTeam = 'Obține informații legate despre echipa {teamName}';
base.strings.voteDescription = 'Hey, {discord}! Poți sa ma votezi pe top.gg!';
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
base.strings.invitationLink = 'Invite the bot on your server';
base.strings.voteLink = 'Vote for the bot';
base.strings.serverLink = 'Official support server';
base.strings.accountLinked = 'Account linked';
base.strings.invite = 'Invite';
base.strings.inviteDescription = `Hey {discord} you can invite me by clicking on the following link!\n${ invite }`;
base.strings.join = 'Join';
base.strings.joinDescription = `Hey {discord} you can join the support server by clicking on the following link!\n${ join }`;
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
base.strings.selectMonth = 'Select a month';
base.strings.loading = 'Loading';
base.strings.pagination = {
  prev: 'Previous Page',
  next: 'Next Page',
  first: 'First Page',
  last: 'Last Page'
};
base.strings.donate = 'Support the project';
base.strings.translation = 'Help with the translation';
base.strings.fullHistory = 'Full history';
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
base.error.user.noParametersNoLink = 'Please specify a user or a team\nYou can also link your discord account with your faceit account to get your stats directly\nTo know how to do it, type `/help command: link`';
base.error.user.noMatches = 'Couldn\'t find any matches for the player **{playerName}**';
base.error.user.lastMatchNoStats = 'Couldn\'t find any stats for the last match of the player **{playerName}**';
base.error.user.noMatchFoundWithOthers = 'Couldn\'t find any matches where **{playerName}** played with the requested players';
base.error.user.noBotLink = 'Sorry, but bots aren\'t really my type';
base.error.user.globalLink = '{discord} already has a global link';
base.error.user.notFound = 'The requested user is not on this server';
base.error.user.mapNotPlayed = 'The player **{playerName}** hasn\'t played on this map';
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
base.error.command.faceitProfileNotFound = 'Faceit profile not found';
base.error.command.faceitDatasNotFound = 'Faceit datas not found';
base.error.command.faceitCsgoStatsNotFound = 'Faceit cs stats not found';
base.error.command.faceitHistoryNotFound = 'Faceit history not found';
base.error.command.faceitMatchStatsNotFound = 'Faceit match stats not found';
base.error.command.faceitLadderNotFound = 'Faceit ladder not found';
base.error.command.steamIdInvalid = 'Steam id invalid';
base.error.command.invalidColor = 'The color given is invalid, please use a hex color';
base.error.command.invalidElo = 'The minimum elo must be lower than the maximum elo';
base.error.command.invalidRole = 'The role given is invalid (must be a role mention or a role id, and must be lower than the bot role)';
base.error.command.requiredParameters = 'The following parameters are required: **{parameters}**\n Please use `/help command: {command}` for more info';
base.error.command.atLeastOneParameter = 'At least one of the following parameters is required: **{parameters}**\n Please use `/help command: {command}` for more info';
base.success.command.removeRoles = 'The roles have been removed successfully';
base.success.command.generateRoles = 'The roles have been generated successfully';
base.success.command.setupRoles = 'The roles have been setup successfully';
base.success.command.removeTeam = 'Your team **{teamName}** has been removed successfully';
base.success.command.updateTeam = 'Your team **{teamName}** has been updated';
base.success.command.createTeam = 'Your team **{teamName}** has been created';
base.success.command.removeUser = '**{playerName}** has been removed from the team **{teamName}**';
base.success.command.addUser = '**{playerName}** has been added to the team **{teamName}**';
base.success.command.unlink = {
  global: 'Ai primit unlink la cont cu succes',
  server: 'Ai primit unlink la cont pe acest server cu succes'
};
base.success.command.link = '{discord} a fost asociat cu **{playerName}**';
base.success.command.setupEloRoles = 'The elo role has been generated successfully';
base.success.command.removeRole = 'The role has been removed successfully';
module.exports = base;