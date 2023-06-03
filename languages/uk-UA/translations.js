/* eslint-disable semi */
const {maxLengthTeamName, invite, join} = require('../../config.json');
const base = structuredClone(require('../base'));
base.command.compare.description = 'Порівняйте статистику обох користувачів';
base.command.dailystats.description = 'Відображає статистику обраного дня з ело-графіком цього дня';
base.command.find.description = 'Знайдіть ігри, в яких є задані гравці (до 5)';
base.command.help.description = 'Відображення списку команд';
base.command.info.description = 'Отримайте інформацію про бота';
base.command.invite.description = 'Отримайте посилання, щоб запросити бота на свій сервер';
base.command.join.description = 'Отримайте посилання для приєднання до сервера спільноти бота';
base.command.last.description = 'Отримайте статистику останньої гри';
base.command.laststats.description = 'Відображає статистику останніх матчів, з ело-графіком останніх матчів';
base.command.link.description = 'Прив\'яжіть профіль Faceit до Discord, щоб отримувати статистику (без параметрів).';
base.command.map.description = 'Відображає статистику обраної мапи';
base.command.monthstats.description = 'Відображає статистику обраного місяця з ело-графіком місяця';
base.command.roles.description = 'Ранги оновлюються щогодини, а також після отримання вашої статистики.';
base.command.stats.description = 'Відображає загальну статистику з ело-графіком останніх 20 ігор';
base.command.team.description = 'Створіть команду та прив\'яжіть до 5 користувачів (обмежено 1 командою на обліковий запис)';
base.command.unlink.description = 'Відв\'яжіть свій faceit id від discord-бота';
base.command.vote.description = 'Отримайте посилання, щоб проголосувати за бота на top.gg';
base.command.weekstats.description = 'Відображає статистику обраного тижня з ело-графіком тижня';
base.command.yearstats.description = 'Відображає статистику обраного року з ело-графіком цього року';
base.options.matchNumber = 'Кількість матчів для відображення. За замовчуванням: {default}';
base.options.steamParameter = 'steamID / steam звичай ID / steam URL профілю / @користувач / CSGO статус';
base.options.faceitParameter = 'faceit псевдонім / @користувач / faceit URL профілю';
base.options.steamParameters = 'steamIDs / steam звичай IDs / steam URLs профілю / @користувачі / CSGO статус';
base.options.faceitParameters = 'faceit прізвиська / @користувачі / faceit URLs профілю';
base.options.faceitParametersTeam = 'faceit прізвиська / @користувачі / faceit URLs профілю (Макс. 5)';
base.options.steamParametersTeam = 'steamIDs / steam звичай IDs / steam URLs профілю / @користувачі / CSGO статус (Макс. 5)';
base.options.teamParameter = 'командний слаг (ви повинні бути його частиною, творцем, або він повинен бути публічним)';
base.options.fromDate = 'Включено. Дата початку, формат ММ/ДД/РРРР';
base.options.toDate = 'Виключено. Кінцева дата (мінімальний інтервал 1 день), якщо порожня - поточний. Формат ММ/ДД/РРРР';
base.options.playerAimed = 'steam_parameters / faceit_parameters / @користувач / порожнє, якщо прив\'язати';
base.options.globalUnlink = 'Це відв\'яже ваш акаунт від усіх серверів (за замовчуванням фальшивий)';
base.options.commandName = 'Назва однієї команди';
base.options.mapName = 'Вкажіть карту, щоб отримати відповідну статистику';
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
base.strings.donate = 'Підтримайте проект';
base.strings.translation = 'Допомога з перекладом';
base.strings.fullHistory = 'Повна історія';
base.error.user.missing = 'Здається, відсутній користувач';
base.error.user.compareSame = 'Ви не можете порівняти того самого користувача';
base.error.user.excluded = 'Ви не можете виключити гравця, якого шукаєте';
base.error.user.teamOwn = 'Ви не володієте командою';
base.error.user.noTeam = 'Ви не володієте командою і не є частиною жодної команди';
base.error.user.teamFull = 'Ви не можете додати більше ніж 5 користувачів до вашої команди';
base.error.user.alreadyInTeam = '**{playerName}** вже є учасником команди **{teamName}**';
base.error.user.notInTeam = '**{playerName}** не є учасником команди **{teamName}**';
base.error.user.permissions = { manageRoles: 'У вас немає прав на керування ролями' };
base.error.user.notLinked = '{discord} не прив\'язаний до жодного облікового запису Faceit';
base.error.user.noParametersNoLink = 'Будь ласка, вкажіть користувача або команду\\nВи також можете зв\'язати свій обліковий запис Discord з обліковим записом Faceit, щоб отримувати свою статистику безпосередньо\\nЩоб дізнатися, як це зробити, введіть `/help command: link`';
base.error.user.noMatches = 'Не вдалося знайти жодного матчу для гравця **{playerName}**';
base.error.user.lastMatchNoStats = 'Не вдалося знайти статистику для останнього матчу гравця **{playerName}**';
base.error.user.noMatchFoundWithOthers = 'Не вдалося знайти жодного матчу, в якому **{playerName}** грав з запитаними гравцями';
base.error.user.noBotLink = 'Вибачте, але боти не зовсім моє захоплення';
base.error.user.globalLink = '{discord} вже має глобальне посилання';
base.error.user.notFound = 'Запитаний користувач не знаходиться на цьому сервері';
base.error.user.mapNotPlayed = 'Гравець **{playerName}** не грав на цій карті';
base.error.execution.command = 'Виникла помилка при виконанні команди';
base.error.execution.selectmenu = 'Виникла помилка при виконанні вибіркового меню';
base.error.execution.button = 'Виникла помилка при виконанні кнопки';
base.error.execution.contextmenu = 'Виникла помилка при виконанні контекстного меню';
base.error.bot.channelNotAccessible = 'У мене немає прав на відправку повідомлень в цьому каналі';
base.error.bot.messageEvent = 'Будь ласка, використовуйте слеш-команди (/)';
base.error.bot.manageRoles = 'У мене немає прав на керування ролями';
base.error.command.notFound = 'Команду не знайдено';
base.error.command.teamNameAlreadyExist = 'Команда з такою назвою вже існує';
base.error.command.teamNameTooLong = `Назва команди занадто довга, вона повинна бути менше ${ maxLengthTeamName } символів`;
base.error.command.alreadyOwnTeam = 'Ви вже є власником команди **{teamName}**';
base.error.command.invalidRoles = 'Одна або декілька ролей недійсні';
base.error.command.roleTooHigh = 'Ця роль вище ролі бота, будь ласка, розмістіть її нижче ролі бота';
base.error.command.teamNotFound = 'Цієї команди не існує';
base.error.command.teamEmpty = 'У цій команді немає жодних учасників';
base.error.command.teamNoAccess = 'Ви не маєте доступу до цієї команди';
base.error.command.faceitProfileNotFound = 'Профіль Faceit не знайдено';
base.error.command.faceitDatasNotFound = 'Дані Faceit не знайдено';
base.error.command.faceitCsgoStatsNotFound = 'Статистика CSGO на Faceit не знайдена';
base.error.command.faceitHistoryNotFound = 'Історію Faceit не знайдено';
base.error.command.faceitMatchStatsNotFound = 'Статистика матчу на Faceit не знайдена';
base.error.command.faceitLadderNotFound = 'Лідерборд на Faceit не знайдено';
base.error.command.steamIdInvalid = 'Недійсний ідентифікатор Steam';
base.success.command.removeRoles = 'Ролі успішно видалено';
base.success.command.generateRoles = 'Ролі успішно згенеровано';
base.success.command.setupRoles = 'Ролі успішно налаштовано';
base.success.command.removeTeam = 'Вашу команду **{teamName}** успішно видалено';
base.success.command.updateTeam = 'Ваша команда **{teamName}** була успішно оновлена';
base.success.command.createTeam = 'Ваша команда **{teamName}** була успішно створена';
base.success.command.removeUser = '**{playerName}** було видалено з команди **{teamName}**';
base.success.command.addUser = '**{playerName}** додано до команди **{teamName}**';
base.success.command.unlink = {
  global: 'Ваш обліковий запис успішно відв’язано',
  server: 'Ваш обліковий запис успішно від’єднано на цьому сервері'
};
base.success.command.link = '{discord} було прив’язано з **{playerName}**';
module.exports = base;