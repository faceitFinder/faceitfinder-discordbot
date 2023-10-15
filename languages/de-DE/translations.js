/* eslint-disable semi */
const {maxLengthTeamName, invite, join} = require('../../config.json');
const base = structuredClone(require('../base'));
base.command.compare.description = 'Vergleiche beide User Statistiken';
base.command.dailystats.description = 'Zeigt die Statistiken des ausgewählten Tages mit der Elo-Grafik des Tages an.';
base.command.find.description = 'Finden heraus, welche der letzten 1000 Spiele die angeforderten Spieler (bis zu 5) enthalten.';
base.command.help.description = 'Zeigt die Befehlsliste an';
base.command.info.description = 'Erhalte Informationen über den Bot';
base.command.invite.description = 'Erhalte den Einladungs-Link, um den Bot auf deinen Server einzuladen';
base.command.join.description = 'Erhalte den Einladungs-Link, um dem Community-Server vom Bot beizutreten';
base.command.last.description = 'Erhalte die Statistiken vom letzten Spiel';
base.command.laststats.description = 'Zeigt die Statistiken des letzten x Spiels mit der Elo-Grafik des letzten X Spiels an';
base.command.link.description = 'Verknüpfe Faceit-Profil mit Discord für direkte Statistikabfrage (keine Parameter nötig)';
base.command.map.description = 'Zeigt die Statistiken von einer ausgewählten Karte an';
base.command.monthstats.description = 'Zeigt die Statistiken von einem ausgewählten Monat mit einem Grafen an';
base.command.roles.description = 'Ränge sind jede Stunde aktualisiert und wenn du deine Statistiken abfragst';
base.command.stats.description = 'Zeigt allgemeine Statistiken mit der Elo-Grafik der letzten 20 Spiele an';
base.command.team.description = 'Erstelle ein Team mit maximal 5 Usern (Limitiert auf ein Team pro Discord-Account)';
base.command.unlink.description = 'Trenne deine FACEIT ID vom Discord-Bot';
base.command.vote.description = 'Erhalte den Link, um für den Bot auf top.gg zu voten';
base.command.weekstats.description = 'Zeigt die Statistiken der ausgewählten Woche mit der Elo-Grafik der Woche an.';
base.command.yearstats.description = 'Zeigt die Statistiken eines ausgewählten Jahres, mit dem Elo-Graf des Jahres an';
base.options.matchNumber = 'Anzahl der anzuzeigenden Spiele. Standard: {default}';
base.options.steamParameter = 'SteamID / Steam custom ID / steam Profil URL / @user / CSGO Status';
base.options.faceitParameter = 'FACEIT Nickname / @user / FACEIT Profil-URL';
base.options.steamParameters = 'SteamIDs / Steam Custom IDs / Steam Profil-URL / @users / CSGO Status';
base.options.faceitParameters = 'FACEIT Nicknamen / @users / FACEIT Profil-URLS';
base.options.faceitParametersTeam = 'FACEIT Nicknamen / @users / FACEIT Profil-URLS (Max. 5)';
base.options.steamParametersTeam = 'SteamIDs / Steam Custom IDs / Steam Profil-URLS / @users / CSGO Status (max. 5)';
base.options.teamParameter = 'Team Slug (du musst Mitglied des Teams sein, der Ersteller sein oder es muss öffentlich sein)';
base.options.fromDate = 'EINGESCHLOSSEN. Startdatum, im Format MM/TT/JJJJ.';
base.options.toDate = 'AUSGESCHLOSSEN: Enddatum (mind. 1 Tag Intervall), leer = heutiger Tag. Format MM/TT/JJJJ.';
base.options.playerAimed = 'Steam_Parameter / FACEIT_Parameter / @User / leer, wenn verknüpft.';
base.options.globalUnlink = 'Dies wird dein Konto auf allen Servern trennen (Standardmäßig auf "False").';
base.options.commandName = 'Der Name eines Befehls';
base.options.mapName = 'Gebe eine Karte an, um die dazugehörigen Statistiken anzuzeigen';
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
base.options.removeOldRoles = 'Entferne alte Rollen, falls sie existieren';
base.options.generateRoles = 'Generiert die Rang-Rollen auf dem Server';
base.options.setupRoles = 'Richte die Rollen ein, die du für jeden Rang auf dem Server haben willst';
base.options.removeRoles = 'Entfernt die Rang-Rollen auf dem Server';
base.options.infoTeam = 'Erhalte Informationen über deine Teams';
base.options.createTeam = 'Erstelle dein Team';
base.options.deleteTeam = 'Lösche dein Team';
base.options.addUserTeam = 'Füge einen User zu deinem Team hinzu';
base.options.updateTeam = 'Aktualisiere dein Team';
base.options.removeUserTeam = 'Entferne einen User von deinem Team';
base.options.nameTeam = `Name von deinem Team, maximal ${ maxLengthTeamName } zeichen`;
base.options.accessTeam = 'Erlaube jedem Discord-User deine Team-Statistiken anzuzeigen';
base.options.excludedSteamParameters = 'Exkludiere Steam-Parameter von der Suche';
base.options.excludedFaceitParameters = 'Exkludiere FACEIT Parameter von der Suche';
base.options.discordUserLink = 'Verknüpfe den Benutzer nur für diesen Server (Rollenberechtigung, um andere zu verknüpfen)';
base.options.nicknameLink = 'Ändert deinen Discord-Nick in deinen FACEIT-Nick (funktioniert nur bei Nicht-Admin-Benutzern)';
base.options.eloRoleName = 'Name, der dieser Rolle zugewiesen werden soll';
base.options.eloRoleColor = 'Farbe, die dieser Rolle zugewiesen werden soll (HEX, z. B. #FF0000).';
base.options.eloRoleMin = 'Minimale Elo benötigt, um diese Rolle zu kriegen (inkludiert)';
base.options.eloRoleMax = 'Maximale Elo benötigt, um diese Rolle zu kriegen (inkludiert)';
base.options.setupEloRoles = 'Erstellt eine Rolle, die den Usern basierend auf dem festgelegten Elo-Bereich zugewiesen wird.';
base.options.removeEloRole = 'Entfernt die ausgewählte Rolle vom Server';
base.options.eloRole = '@Rolle';
base.options.gameParameter = 'Spiel, von dem die Statistiken abgerufen werden sollen (Standard: CS2).';
base.strings.selectTeam = 'Wähle ein Team aus';
base.strings.infoTeam = 'Erhalte Informationen über das Team {teamName}';
base.strings.voteDescription = 'Hey, {discord}! Du kannst auf top.gg voten, um mir beim Wachsen zu helfen';
base.strings.messageProcessing = 'Deine Anfrage wird bearbeitet...';
base.strings.error = 'Fehler';
base.strings.info = 'Info';
base.strings.compare = 'Vergleich zwischen {playerName1} und {playerName2}';
base.strings.matchPlayed = '{matchNumber} Spiele gespielt';
base.strings.selectDate = 'Wähle ein Datum aus';
base.strings.helpInfo = 'Informationen zum Befehl {command} \n<>: Optional, []: Erforderlich, {}: Erforderlich, wenn nicht verknüpft.';
base.strings.noOptions = 'Dieser Befehl benötigt keine Optionen';
base.strings.commands = 'Befehle';
base.strings.help = 'Hilfe';
base.strings.helpDescription = '/help <command> Für mehr Informationen zu einem spezifischen Befehl';
base.strings.stats = 'Statistiken';
base.strings.system = 'System';
base.strings.utility = 'Dienstprogramm';
base.strings.description = 'Beschreibung';
base.strings.options = 'Optionen';
base.strings.usage = 'Nutzung';
base.strings.example = 'Beispiel';
base.strings.creator = 'Ersteller';
base.strings.invitationLink = 'Lade den Bot zu deinem Server ein';
base.strings.voteLink = 'Vote für den Bot';
base.strings.serverLink = 'Offizieller Support Server';
base.strings.accountLinked = 'Account verbunden';
base.strings.invite = 'Einladung';
base.strings.inviteDescription = `Hey {discord}, du kannst mich einladen, indem du auf den folgenden Link drückst!\n${ invite }`;
base.strings.join = 'Beitreten';
base.strings.joinDescription = `Hey {discord}, du kannst dem Support Server beitreten, indem du auf den folgenden Link drückst!\n${ join }`;
base.strings.selectMatchBelow = 'Wähle eines der Spiele unten aus';
base.strings.lastMatchLabel = 'Informationen zu den Statistiken des letzten Spiels';
base.strings.lastMatchDescription = 'Informationen über das letzte Spiel';
base.strings.selectAnotherMatch = 'Wähle ein anderes Spiel aus';
base.strings.lastStatsLabel = 'Statistiken vom letzten Spiel';
base.strings.selectMap = 'Wähle eine Karte aus';
base.strings.selectMapDescription = 'Wähle eine der folgenden Karten aus, um die relevanten Statistiken dazuzubekommen, ({playerName})';
base.strings.selectWeek = 'Wähle eine Woche aus';
base.strings.year = 'Jahr';
base.strings.selectYear = 'Wähle ein Jahr aus';
base.strings.selectMonth = 'Wähle einen Monat aus';
base.strings.loading = 'Laden';
base.strings.pagination = {
  prev: 'Vorherige Seite',
  next: 'Nächste Seite',
  first: 'Erste Seite',
  last: 'Letzte Seite'
};
base.strings.donate = 'Unterstütze das Projekt';
base.strings.translation = 'Helfe mit der Übersetzung';
base.strings.fullHistory = 'Kompletter Verlauf';
base.error.user.missing = 'Es scheint, als fehle ein User';
base.error.user.compareSame = 'Du kannst nicht den gleichen User vergleichen';
base.error.user.excluded = 'Du kannst keinen Spieler ausschließen, nach dem du suchst';
base.error.user.teamOwn = 'Du besitzt kein Team';
base.error.user.noTeam = 'Du besitzt kein Team und bist auch kein Mitglied eines';
base.error.user.teamFull = 'Du kannst nicht mehr als 5 User zu deinem Team hinzufügen';
base.error.user.alreadyInTeam = '**{playerName}** ist schon im Team **{teamName}**';
base.error.user.notInTeam = '**{playerName}** ist kein Mitglied des Teams **{teamName}**';
base.error.user.permissions = { manageRoles: 'Du kannst keine Berechtigung, um Rollen zu verwalten' };
base.error.user.notLinked = '{discord} ist mit keinem FACEIT Account verbunden';
base.error.user.noParametersNoLink = 'Bitte gib einen Benutzer oder ein Team an. \nDu kannst auch dein Discord-Account mit deinem FACEIT-Account verknüpfen, um deine Statistiken direkt zu erhalten. \nUm zu erfahren, wie das geht, gib /help command: link ein';
base.error.user.noMatches = 'Konnte kein Spiel für den User **{playerName}** finden';
base.error.user.lastMatchNoStats = 'Konnte keine Statistiken für das letzte Spiel von **{playerName}** finden';
base.error.user.noMatchFoundWithOthers = 'Konnte keine Spiele finden, wo **{playerName}** mit den angegebenen Spielern gespielt hat';
base.error.user.noBotLink = 'Tut mir leid, aber Bots sind nicht so mein Typ';
base.error.user.globalLink = '{discord} hat schon einen Globalen-Link';
base.error.user.notFound = 'Der angefragte User ist nicht auf dem Server';
base.error.user.mapNotPlayed = 'Der Spieler **{playerName}**, hat noch nicht auf dieser Karte gespielt';
base.error.execution.command = 'Es ist ein Fehler aufgetreten, während der Befehl ausgeführt wurde';
base.error.execution.selectmenu = 'Es ist ein Fehler aufgetreten, während das Auswahlfeld ausgeführt wurde';
base.error.execution.button = 'Es ist ein Fehler aufgetreten, während des Drückens des Knopfes';
base.error.execution.contextmenu = 'Es ist ein Fehler aufgetreten, während das Kontextmenü ausgeführt wurde';
base.error.bot.channelNotAccessible = 'Ich habe keine Berechtigung, um in diesem Kanal Nachrichten zu schicken';
base.error.bot.messageEvent = 'Bitte benutze Slash-Befehle (/)';
base.error.bot.manageRoles = 'Ich habe keine Berechtigung, um Rollen zu verwalten';
base.error.command.notFound = 'Befehl nicht gefunden';
base.error.command.teamNameAlreadyExist = 'Ein Team mit dem Namen existiert bereits';
base.error.command.teamNameTooLong = `Der Teamname ist zu lang, er muss weniger als ${ maxLengthTeamName } Zeichen`;
base.error.command.alreadyOwnTeam = 'Dir gehört bereits das Team **{teamName}**';
base.error.command.invalidRoles = 'Eine oder mehrere Rollen sind ungültig';
base.error.command.roleTooHigh = 'Diese Rolle ist höher als die Bot-Rolle, bitte platziere sie unter der Bot-Rolle';
base.error.command.teamNotFound = 'Dieses Team existiert nicht';
base.error.command.teamEmpty = 'Dieses Team hat keine Mitglieder';
base.error.command.teamNoAccess = 'Du hast keinen Zugriff auf dieses Team';
base.error.command.faceitProfileNotFound = 'FACEIT Profil nicht gefunden';
base.error.command.faceitDatasNotFound = 'FACEIT Daten nicht gefunden';
base.error.command.faceitCsgoStatsNotFound = 'FACEIT CS Statistiken nicht gefunden';
base.error.command.faceitHistoryNotFound = 'FACEIT Verlauf nicht gefunden';
base.error.command.faceitMatchStatsNotFound = 'FACEIT Spiel-Statistiken nicht gefunden';
base.error.command.faceitLadderNotFound = 'FACEIT Leiter nicht gefunden';
base.error.command.steamIdInvalid = 'Steam ID ungültig';
base.error.command.invalidColor = 'Die angegebene Farbe ist ungültig, bitte benutze eine Hex Farbe';
base.error.command.invalidElo = 'Der Mindest-Elo muss niedriger sein als der Höchst-Elo';
base.error.command.invalidRole = 'Die angegebene Rolle ist ungültig (muss eine Rollen-Erwähnung oder eine Rollen-ID sein und niedriger als die Bot-Rolle sein).';
base.error.command.requiredParameters = 'Die folgenden Parameter sind erforderlich: **{parameters}**. \nBitte verwende /help command: {command} für weitere Informationen.';
base.error.command.atLeastOneParameter = 'Mindestens einer der folgenden Parameter ist zwingend: **{parameters}**\n Bitte benutze `/help command: {command}` für mehr Informationen.';
base.success.command.removeRoles = 'Die Rollen wurden erfolgreich entfernt';
base.success.command.generateRoles = 'Die Rollen wurden erfolgreich generiert';
base.success.command.setupRoles = 'Die Rollen wurden erfolgreich eingerichtet';
base.success.command.removeTeam = 'Dein Team **{teamName}** wurde erfolgreich entfernt';
base.success.command.updateTeam = 'Dein Team **{teamName}** wurde aktualisiert';
base.success.command.createTeam = 'Dein Team **{teamName}** wurde erstellt';
base.success.command.removeUser = '**{playerName}** wurde erfolgreich aus dem Team **{teamName}** entfernt';
base.success.command.addUser = '**{playerName}** wurde dem Team **{teamName}** erfolgreich hinzugefügt';
base.success.command.unlink = {
  global: 'Dein Account wurde erfolgreich getrennt',
  server: 'Dein Account wurde erfolgreich vom Server getrennt'
};
base.success.command.link = '{discord} wurde verbunden mit **{playerName}**';
base.success.command.setupEloRoles = 'Die Elo-Rolle wurde erfolgreich generiert';
base.success.command.removeRole = 'Die Rolle wurde erfolgreich entfernt';
module.exports = base;