/* eslint-disable semi */
const { maxLengthTeamName, invite, join, oauth2, unlinkVerified, linkVerified } = require('../../config.json');
const base = structuredClone(require('../base'));
base.command.compare.description = 'Сравнить статистику обоих пользователей';
base.command.dailystats.description = 'Отобразить статистику с графиком эло за указанный день';
base.command.find.description = 'Узнайте, в каких из последних 1000 игр участвуют запрашиваемые игроки (до 5 игроков)';
base.command.help.description = 'Отобразить список команд';
base.command.info.description = 'Получить информацию о боте';
base.command.invite.description = 'Получить ссылку для приглашения бота на свой сервер';
base.command.join.description = 'Получить ссылку, чтобы присоединиться к серверу сообщества FaceitFinder';
base.command.last.description = 'Получить статистику последней игры';
base.command.laststats.description = 'Отобразить статистику с графиком эло за последние Х матчей';
base.command.link.description = 'Связать профиль Faceit с Discord, чтобы напрямую получать свою статистику (параметры не требуются)';
base.command.map.description = 'Показать статистику по указанной карте';
base.command.monthstats.description = 'Отобразить статистику с графиком эло за указанный месяц';
base.command.roles.description = 'Ранги обновляются каждый час и тогда, когда вы пытаетесь получить свою статистику';
base.command.stats.description = 'Отобразить общую статистику с графиком эло за последние 20 игр';
base.command.team.description = 'Создать команду и добавить в неё до 5 пользователей (кол-во команд ограничено уч. записью Discord)';
base.command.unlink.description = 'Отвязать аккаунт Faceit от Discord';
base.command.vote.description = 'Получить ссылку на страницу для голосования за бота на top.gg';
base.command.weekstats.description = 'Отобразить статистику с графиком эло за указанную неделю';
base.command.yearstats.description = 'Отобразить статистику с графиком эло за указанный год';
base.options.matchNumber = 'Количество отображаемых матчей. По умолчанию: {default}';
base.options.steamParameter = 'steamID / Персональный steamID / Ссылка на профиль Steam / @username / CSGO status';
base.options.faceitParameter = 'Никнейм на Faceit / @username / Ссылка на профиль Faceit';
base.options.steamParameters = 'steamID / Персональный steamIDs / Ссылки на профиля Steam / @username / CSGO status';
base.options.faceitParameters = 'Никнейм на Faceit / @username / Ссылки на профиля Faceit';
base.options.faceitParametersTeam = 'Никнейм на Faceit / @username / Ссылка на профиль Faceit (Максимум 5)';
base.options.steamParametersTeam = 'steamID / Персональный steamIDs / Ссылки на профили Steam / @username / CSGO status (Максимум 5)';
base.options.teamParameter = 'Слоган команды (вы должны быть её создателем, участником или же команда должна быть общедоступной)';
base.options.fromDate = 'Дата начала. Формат даты: ММ/ДД/ГГГГ';
base.options.toDate = 'Дата окончания (интервал не менее 1 дня). Если пусто, берётся текущий день. Формат даты: ММ/ДД/ГГГГ';
base.options.playerAimed = 'steam_параметры / faceit_параметры / @username / пусто, если привязан / CSGO status';
base.options.globalUnlink = 'Отвязать вашу учётную запись на всех серверах (False по умолчанию)';
base.options.commandName = 'Название команды';
base.options.mapName = 'Укажите карту, чтобы получить соответствующую статистику';
base.options.levelRoles = {
  1: 'Уровень 1',
  2: 'Уровень 2',
  3: 'Уровень 3',
  4: 'Уровень 4',
  5: 'Уровень 5',
  6: 'Уровень 6',
  7: 'Уровень 7',
  8: 'Уровень 8',
  9: 'Уровень 9',
  10: 'Уровень 10'
};
base.options.removeOldRoles = 'Удалить старые роли рангов, если они существуют';
base.options.generateRoles = 'Создать роли рангов, которые соответствуют уровням';
base.options.setupRoles = 'Настроить роли уровней';
base.options.removeRoles = 'Удалить роли уровней';
base.options.infoTeam = 'Получить информацию о своих командах';
base.options.createTeam = 'Создать команду';
base.options.deleteTeam = 'Удалить команду';
base.options.addUserTeam = 'Добавить пользователя в свою команду';
base.options.updateTeam = 'Изменить команду';
base.options.removeUserTeam = 'Удалить пользователя со своей команды';
base.options.nameTeam = `Название вашей команды, максимум ${maxLengthTeamName} символов`;
base.options.accessTeam = 'Разрешить каждому пользователю Discord видеть статистику вашей команды';
base.options.excludedSteamParameters = 'Исключить параметры Steam из поиска';
base.options.excludedFaceitParameters = 'Исключить параметры Faceit из поиска';
base.options.discordUserLink = 'Связать профиль пользователя только для этого сервера';
base.options.nicknameLink = 'Сделать ваш Discord-никнейм таким же, как никнейм на Faceit (Нужно право редактирования никнеймов)';
base.options.eloRoleName = 'Имя для назначения данной роли';
base.options.eloRoleColor = 'Цвет для назначения данной роли (HEX, например: #FF0000)';
base.options.eloRoleMin = 'Минимальный рейтинг Elo, необходимый для получения этой роли (включительно)';
base.options.eloRoleMax = 'Максимальный рейтинг Elo, необходимый для получения этой роли (включительно)';
base.options.setupEloRoles = 'Генерирует роль, которая будет назначаться пользователям в зависимости от заданного диапазона Elo';
base.options.removeEloRole = 'Удаляет выбранную роль с сервера';
base.options.eloRole = '@роль';
base.options.gameParameter = 'Игра, из которой извлекается статистика (по умолчанию: CS2)';
base.strings.selectTeam = 'Выбрать команду';
base.strings.infoTeam = 'Получить информацию о команде {teamName}';
base.strings.voteDescription = 'Эй, {discord}! Проголосуй за меня на top.gg, чтобы помочь мне развиться';
base.strings.messageProcessing = 'Ваш запрос обрабатывается...';
base.strings.error = 'Ошибка';
base.strings.info = 'Информация';
base.strings.compare = 'Сравнение {playerName1} и {playerName2}';
base.strings.matchPlayed = '{matchNumber} сыгранных матчей';
base.strings.selectDate = 'Выберите дату';
base.strings.helpInfo = 'Информация о команде **{command}** \n `<>` = Необязательно, `[]` = Обязательно, `{}` = Обязательно, если не привязан профиль';
base.strings.noOptions = 'Эта команда не требует параметров';
base.strings.commands = 'Команды';
base.strings.help = 'Помощь';
base.strings.helpDescription = '`/help <command>` для получения подробной информации о конкретной команде';
base.strings.stats = 'Статистика';
base.strings.system = 'Система';
base.strings.utility = 'Утилиты';
base.strings.description = 'Описание';
base.strings.options = 'Параметры';
base.strings.usage = 'Использование';
base.strings.example = 'Пример';
base.strings.creator = 'Создатель';
base.strings.invitationLink = 'Пригласите бота на свой сервер';
base.strings.voteLink = 'Проголосуйте за бота';
base.strings.serverLink = 'Официальный сервер поддержки';
base.strings.accountLinked = 'Связанный Discord-аккаунт';
base.strings.invite = 'Пригласить';
base.strings.inviteDescription = `Эй, {discord}! Ты можешь пригласить меня на свой сервер, нажав на эту ссылку!\n ${invite}`;
base.strings.join = 'Присоединиться';
base.strings.joinDescription = `Эй, {discord}! Ты можешь присоединиться к серверу бота, нажав на эту ссылку!\n ${join}`;
base.strings.selectMatchBelow = 'Выберите один из нижеприведенных матчей';
base.strings.lastMatchLabel = 'Информация о статистике последнего матча';
base.strings.lastMatchDescription = 'Информация о последнем матче';
base.strings.selectAnotherMatch = 'Выбрать другой матч';
base.strings.lastStatsLabel = 'Статистика последних матчей';
base.strings.selectMap = 'Выбрать карту';
base.strings.selectMapDescription = 'Выберите одну из следующих карт, чтобы получить статистику (**{playerName}**).';
base.strings.selectWeek = 'Выберите неделю';
base.strings.year = 'Год';
base.strings.selectYear = 'Выберите год';
base.strings.selectMonth = 'Выберите месяц';
base.strings.loading = 'Загрузка';
base.strings.pagination = {
  prev: 'Предыдущая страница',
  next: 'Следующая страница',
  first: 'Первая страница',
  last: 'Последняя страница'
};
base.strings.donate = 'Поддержать проект';
base.strings.fullHistory = 'Полная история';
base.error.user.noParameters = 'Эта функция доступна только для премиум-гильдий. Станьте премиум-гильдией, нажав на кнопку ниже.';
base.error.user.missing = 'Похоже, что один или несколько пользователей отсутствуют';
base.error.user.compareSame = 'Вы не можете сравнить одного и того же пользователя';
base.error.user.excluded = 'Вы не можете исключить игрока, которого ищете';
base.error.user.teamOwn = 'У вас нет команды';
base.error.user.noTeam = 'У вас нет команды и вы не являетесь членом какой-либо команды';
base.error.user.teamFull = 'Вы не можете добавить в свою команду больше 5 игроков.';
base.error.user.alreadyInTeam = '**{playerName}** уже является членом команды **{teamName}**';
base.error.user.notInTeam = '**{playerName}** не является членом команды **{teamName}**';
base.error.user.permissions = { manageRoles: 'У вас нет разрешения на управление ролями' };
base.error.user.notLinked = 'Профиль {discord} не связан с какой-либо учетной записью Faceit';
base.error.user.noParametersNoLink = 'Пожалуйста, укажите пользователя или команду\nВы также можете связать свою учетную запись Discord с вашей учетной записью Faceit, чтобы получать свою статистику напрямую.\nЧтобы узнать, как это сделать, введите `/help command: link`';
base.error.user.noMatches = 'Не удалось найти матчи игрока **{playerName}**';
base.error.user.lastMatchNoStats = 'Не удалось найти статистику для последнего матча игрока **{playerName}**';
base.error.user.noMatchFoundWithOthers = 'Не удалось найти матчи, в которых {playerName} играл с указанными игроками';
base.error.user.noBotLink = 'Извините, но вы не можете привязать аккаунт бота...';
base.error.user.globalLink = '{discord} уже связал свой профиль';
base.error.user.notFound = 'Запрашиваемый пользователь не является участником этого сервера';
base.error.user.mapNotPlayed = 'Игрок **{playerName}** не играл на этой карте.';
base.error.execution.command = 'При выполнении команды произошла ошибка';
base.error.execution.selectmenu = 'Произошла ошибка при использовании меню выбора';
base.error.execution.button = 'Произошла ошибка при использовании кнопки';
base.error.execution.contextmenu = 'Произошла ошибка при использовании контекстного меню';
base.error.bot.channelNotAccessible = 'У меня нет прав для отправки сообщений в этот канал';
base.error.bot.messageEvent = 'Пожалуйста, используйте слэш-команды (/)';
base.error.bot.manageRoles = 'У меня нет прав для управления ролями';
base.error.command.notFound = 'Команда не найдена';
base.error.command.teamNameAlreadyExist = 'Команда с таким именем уже существует';
base.error.command.teamNameTooLong = `Слишком длинное имя команды. Оно должно быть не более ${maxLengthTeamName} символов`;
base.error.command.alreadyOwnTeam = 'Вы уже являетесь владельцем команды **{teamName}**';
base.error.command.invalidRoles = 'Одна или несколько ролей недействительны';
base.error.command.roleTooHigh = 'Эта роль выше, чем у бота. Пожалуйста, переместите ее ниже роли бота';
base.error.command.teamNotFound = 'Этой команды не существует';
base.error.command.teamEmpty = 'В этой команде нет участников';
base.error.command.teamNoAccess = 'У вас нет доступа к этой команде';
base.error.command.faceitProfileNotFound = 'Профиль Faceit не найден';
base.error.command.faceitDatasNotFound = 'Данные Faceit не найдены';
base.error.command.faceitCsgoStatsNotFound = 'Статистика Faceit CS не найдена';
base.error.command.faceitHistoryNotFound = 'История Faceit не найдена';
base.error.command.faceitMatchStatsNotFound = 'Статистика матча Faceit не найдена';
base.error.command.faceitLadderNotFound = 'Ладдер Faceit не найден';
base.error.command.steamIdInvalid = 'Недействительный идентификатор Steam';
base.error.command.invalidColor = 'Указан недопустимый цвет, пожалуйста, используйте HEX-код цвета';
base.error.command.invalidElo = 'Минимальное elo должно быть меньше максимального elo';
base.error.command.invalidRole = 'Указана недопустимая роль (должно быть упоминание роли или идентификатор роли, и роль должна быть ниже роли бота)';
base.error.command.requiredParameters = 'Следующие параметры обязательны: **{parameters}**\n Пожалуйста, используйте `/help command: {command}` для получения дополнительной информации';
base.error.command.atLeastOneParameter = 'Требуется хотя бы один из следующих параметров: **{parameters}**\nПожалуйста, используйте `/help command: {command}` для получения дополнительной информации';
base.success.command.removeRoles = 'Роли успешно удалены';
base.success.command.generateRoles = 'Роли успешно созданы';
base.success.command.setupRoles = 'Роли успешно настроены';
base.success.command.removeTeam = 'Команда **{teamName}** успешно удалена';
base.success.command.updateTeam = 'Команда **{teamName}** успешно обновлена';
base.success.command.createTeam = 'Команда **{teamName}** успешно создана';
base.success.command.removeUser = '**{playerName}** успешно удален из команды **{teamName}**';
base.success.command.addUser = '**{playerName}** успешно добавлен в команду **{teamName}**';
base.success.command.unlink = {
  global: 'Ваша учетная запись успешно отвязана',
  server: 'Ваша учетная запись успешно отвязана на этом сервере'
};
base.success.command.link = '{discord} был связан с **{playerName}**';
base.success.command.setupEloRoles = 'Роль Elo была успешно создана';
base.success.command.removeRole = 'Роль была успешно удалена';
base.command.verify.description = 'Подтвердите ваш аккаунт Faceit'
base.strings.verifyDescription = `Привет {discord}, чтобы подтвердить ваш аккаунт Faceit, нажмите на ссылку ниже!\n${oauth2}\nПосле подтверждения вашего аккаунта, вы сможете получить привязанную роль и многое другое!`
base.strings.verify = 'Подтверждение'
base.error.user.unlink.verified = `Поскольку ваш аккаунт подтвержден, вам необходимо отвязать ваш аккаунт на веб-сайте. Нажмите на ссылку ниже, чтобы сделать это.\n${unlinkVerified}`
base.error.user.link.verified.other = `Этот аккаунт подтверждён, пользователю нужно выбрать гильдию на сайте, чтобы связать её\n${linkVerified}`
module.exports = base;
