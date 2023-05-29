/* eslint-disable semi */
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
base.command.link.description = 'Link a faceit profile to the discord user, to get your stats directly (no parameters needed)';
base.command.map.description = 'Displays the stats of the chosen map';
base.command.monthstats.description = 'Displays the stats of the chosen month, with elo graph of the month';
base.command.roles.description = 'Ranks are updated every hour and when you get your stats';
base.command.stats.description = 'Displays general stats, with elo graph of the 20 last games';
base.command.team.description = 'Create a team and link up to 5 users to it (limited to 1 team by discord account)';
base.command.unlink.description = 'Unlink your faceit id from the discord bot';
base.command.vote.description = 'Get the link to vote for the bot on top.gg';
base.command.weekstats.description = 'Displays the stats of the chosen week, with elo graph of the week';
base.command.yearstats.description = 'Displays the stats of the chosen year, with elo graph of the year';
base.options.matchNumber = 'Number of matches to display. Default: {default}';
base.options.steamParameter = 'steamID / steam custom ID / steam profile url / @user / CSGO status';
base.options.faceitParameter = 'faceit nickname / @user / faceit profile url';
base.options.steamParameters = 'steamIDs / steam custom IDs / steam profile urls / @users / CSGO status';
base.options.faceitParameters = 'faceit nicknames / @users / faceit profile urls';
base.options.faceitParametersTeam = 'faceit nicknames / @users / faceit profile urls (Max 5)';
base.options.steamParametersTeam = 'steamIDs / steam custom IDs / steam profile urls / @users / CSGO status (Max 5)';
base.options.teamParameter = 'team slug (you need to be a part of it, the creator, or it has to be public)';
base.options.fromDate = 'INCLUDED. Start date, format MM/DD/YYYY';
base.options.toDate = 'EXCLUDED. End date (at least 1 day interval), if empty gets the current day Format MM/DD/YYYY';
base.options.playerAimed = 'steam_parameters / faceit_parameters / @user / empty if linked';
base.options.globalUnlink = 'This will unlink your account on all servers (False by default)';
base.options.commandName = 'The name of one command';
base.options.mapName = 'Specify a map to get the stats related';
base.options.levelRoles = {
  1: '1-й рівень',
  2: '2-й рівень',
  3: '3-й рівень',
  4: '4-й рівень',
  5: '5-й рівень',
  6: '6-й рівень',
  7: '7-й рівень',
  8: '8-й рівень',
  9: '9-й рівень',
  10: '10-й рівень'
};
base.options.removeOldRoles = 'Видалити старі ролі, якщо вони існують';
base.options.generateRoles = 'Генерує ранги ролей на сервері';
base.options.setupRoles = 'Налаштувати ролі, які ви бажаєте для кожного рангу на сервері';
base.options.removeRoles = 'Видаляє рангові ролі на сервері';
base.options.infoTeam = 'Отримати інформацію про свої команди';
base.options.createTeam = 'Створити команду';
base.options.deleteTeam = 'Видалити вашу команду';
base.options.addUserTeam = 'Додати користувача до команди';
base.options.updateTeam = 'Оновити вашу команду';
base.options.removeUserTeam = 'Видаляє користувача з команди';
base.options.nameTeam = `назва вашої команди, до ${ maxLengthTeamName } символів`;
base.options.accessTeam = 'Дозволити кожному користувачеві Discord показувати статистику вашої команди';
base.options.excludedSteamParameters = 'Виключити з пошуку параметри Steam';
base.options.excludedFaceitParameters = 'Виключити параметри Faceit з пошуку';
base.options.discordUserLink = 'Прив\'язати користувача лише до цього сервера (Права на керування ролями для прив\'язки іншої особи)';
base.options.nicknameLink = 'Зробити нік Discord таким же, як у Faceit (тільки для неадміністраторів)';
base.strings.selectTeam = 'Вибрати команду';
base.strings.infoTeam = 'Отримати інформацію про команду {teamName}';
base.strings.voteDescription = 'Агов, {discord}! Ви можете проголосувати на top.gg, щоб допомогти мені розвиватися';
base.strings.messageProcessing = 'Ваш запит зараз обробляється...';
base.strings.error = 'Помилка';
base.strings.info = 'Інформація';
base.strings.compare = 'Порівняння між {playerName1} та {playerName2}';
base.strings.matchPlayed = 'Зіграно матчів: {matchNumber}';
base.strings.selectDate = 'Виберіть дату';
base.strings.helpInfo = 'Інформація про команду {command} \n `<>`: Необов’язково, `[]`: Обов’язково, `{}`: Обов’язково, якщо не пов’язано';
base.strings.noOptions = 'Ця команда не потребує жодних параметрів';
base.strings.commands = 'Команди';
base.strings.help = 'Довідка';
base.strings.helpDescription = '/help <command> для отримання додаткової інформації про конкретну команду';
base.strings.stats = 'Статистика';
base.strings.system = 'Система';
base.strings.utility = 'Утиліта';
base.strings.description = 'Опис';
base.strings.options = 'Параметри';
base.strings.usage = 'Використання';
base.strings.example = 'Приклад';
base.strings.creator = 'Творець';
base.strings.invitationLink = 'Запросити бота на свій сервер';
base.strings.voteLink = 'Проголосувати за бота';
base.strings.serverLink = 'Офіційний сервер підтримки';
base.strings.accountLinked = 'Обліковий запис прив’язано';
base.strings.invite = 'Запросити';
base.strings.inviteDescription = `Привіт {discord}, ти можеш запросити мене, натиснувши на наступне посилання!\n${ invite }`;
base.strings.join = 'Приєднатися';
base.strings.joinDescription = `Привіт {discord}, ти можеш приєднатися до сервера підтримки, натиснувши на наступне посилання!\n${ join }`;
base.strings.selectMatchBelow = 'Будь ласка, оберіть один з матчів нижче.';
base.strings.lastMatchLabel = 'Статистика останнього матчу';
base.strings.lastMatchDescription = 'Інформація про останній матч';
base.strings.selectAnotherMatch = 'Вибрати інший матч';
base.strings.lastStatsLabel = 'Статистика останніх матчів';
base.strings.selectMap = 'Вибрати мапу';
base.strings.selectMapDescription = 'Виберіть одну з наступних мап, щоб отримати статистику, пов’язану з нею ({playerName})';
base.strings.selectWeek = 'Виберіть тиждень';
base.strings.year = 'Рік';
base.strings.selectYear = 'Виберіть рік';
base.strings.selectMonth = 'Виберіть місяць';
base.strings.loading = 'Завантаження';
base.strings.pagination = {
  prev: 'Попередня сторінка',
  next: 'Наступна сторінка',
  first: 'Перша сторінка',
  last: 'Остання сторінка'
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
base.error.command.faceitCsgoStatsNotFound = 'Faceit csgo stats not found';
base.error.command.faceitHistoryNotFound = 'Faceit history not found';
base.error.command.faceitMatchStatsNotFound = 'Faceit match stats not found';
base.error.command.faceitLadderNotFound = 'Faceit ladder not found';
base.error.command.steamIdInvalid = 'Steam id invalid';
base.success.command.removeRoles = 'The roles have been removed successfully';
base.success.command.generateRoles = 'The roles have been generated successfully';
base.success.command.setupRoles = 'The roles have been setup successfully';
base.success.command.removeTeam = 'Your team **{teamName}** has been removed successfully';
base.success.command.updateTeam = 'Your team **{teamName}** has been updated';
base.success.command.createTeam = 'Your team **{teamName}** has been created';
base.success.command.removeUser = '**{playerName}** has been removed from the team **{teamName}**';
base.success.command.addUser = '**{playerName}** has been added to the team **{teamName}**';
base.success.command.unlink = {
  global: 'Ваш обліковий запис успішно відв’язано',
  server: 'Ваш обліковий запис успішно від’єднано на цьому сервері'
};
base.success.command.link = '{discord} було прив’язано з **{playerName}**';
module.exports = base;