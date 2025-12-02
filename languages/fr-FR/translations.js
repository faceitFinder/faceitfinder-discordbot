/* eslint-disable semi */
const { maxLengthTeamName, invite, join, oauth2, unlinkVerified, linkVerified } = require('../../config.json');
const base = structuredClone(require('../base'));
base.command.compare.description = 'Comparer les statistiques des 2 joueurs.';
base.command.dailystats.description = 'Obtenir les statistiques du jour sélectionné, accompagné d\'un graphique de l\'évolution de l\'elo.';
base.command.find.description = 'Trouver parmi les 1000 dernières parties celles qui incluent les joueurs demandés (jusqu\'à 5).';
base.command.help.description = 'Obtenir la liste des commandes.';
base.command.info.description = 'Obtenir des informations sur le bot.';
base.command.invite.description = 'Obtenir le lien pour inviter le bot sur votre serveur.';
base.command.join.description = 'Obtenir le lien pour rejoindre le serveur communautaire du bot.';
base.command.last.description = 'Obtenir les statistiques de la dernière partie.';
base.command.laststats.description = 'Obtenir les statistiques des x dernières parties, accompagné d\'un graphique de l\'évolution de l\'elo.';
base.command.link.description = 'Associer un profil faceit à un utilisateur discord, pour obtenir vos statistiques directement.';
base.command.verify.description = 'Vérifier votre compte faceit'
base.command.map.description = 'Obtenir les statistiques de la map sélectionnée';
base.command.monthstats.description = 'Obtenir les statistiques du mois sélectionné, accompagné d\'un graphique de l\'évolution de l\'elo.';
base.command.roles.description = 'Les rangs sont mis à jour toutes les heures et quand vous obtenez vos statistiques.';
base.command.stats.description = 'Obtenir les statistiques générales, accompagné d\'un graphique de l\'évolution de l\'elo.';
base.command.team.description = 'Créer une équipe et lier jusqu\'à 5 utilisateurs à celle-ci (limite d\'une équipe par compte discord).';
base.command.unlink.description = 'Supprimer l\'association entre votre compte discord et votre profil faceit.';
base.command.vote.description = 'Obtenir le lien pour voter pour le bot sur top.gg.';
base.command.weekstats.description = 'Obtenir les statistiques de la semaine sélectionnée, accompagné d\'un graphique d\'évolution de l\'elo.';
base.command.yearstats.description = 'Obtenir les statistiques de l\'année sélectionnée, accompagné d\'un graphique d\'évolution de l\'elo.';
base.options.matchNumber = 'Nombre de parties à afficher, par défaut : {default}.';
base.options.steamParameter = 'steamID / steamID personnalisé / url profil steam / @utilisateur / status CSGO.';
base.options.faceitParameter = 'pseudo faceit / @utilisateur / url profil faceit.';
base.options.steamParameters = 'steamIDs / steamIDs personnalisés / url profils steam / @utilisateurs / status CSGO.';
base.options.faceitParameters = 'pseudos faceit / @utilisateurs / url profils faceit.';
base.options.faceitParametersTeam = 'pseudos faceit / @utilisateurs / url profils faceit (Max 5).';
base.options.steamParametersTeam = 'steamIDs / steamIDs personnalisés / url profils steam / @utilisateurs / status CSGO (Max 5).';
base.options.teamParameter = 'slug d\'une équipe (vous devez en faire partie, être le créateur, ou que l\'équipe soit publique).';
base.options.fromDate = 'INCLUS. Date de début au format MM/JJ/AAAA.';
base.options.toDate = 'EXCLUS. Date de fin au format MM/JJ/AAAA, par défaut la date du jour, 1 jour d\'écart minimum.';
base.options.playerAimed = 'steam_parameter / faceit_parameter / @user / vide (pour vous-même si lié).';
base.options.globalUnlink = 'Supprimer l\'ensemble des associations faites avec votre compte discord (faux par défaut)';
base.options.commandName = 'Nom de la commande à afficher.';
base.options.mapName = 'Sélectionner une map pour obtenir les statistiques associées.';
base.options.levelRoles = {
  1: 'Niveau 1.',
  2: 'Niveau 2.',
  3: 'Niveau 3.',
  4: 'Niveau 4.',
  5: 'Niveau 5.',
  6: 'Niveau 6.',
  7: 'Niveau 7.',
  8: 'Niveau 8.',
  9: 'Niveau 9.',
  10: 'Niveau 10.'
};
base.options.removeOldRoles = 'Supprimer les anciens rôles, si existants.';
base.options.generateRoles = 'Générer les rôles.';
base.options.setupRoles = 'Configurer les rôles.';
base.options.removeRoles = 'Supprimer les rôles.';
base.options.infoTeam = 'Afficher les informations des équipes dans lesquelles vous êtes.';
base.options.createTeam = 'Créer votre équipe.';
base.options.deleteTeam = 'Supprimer votre équipe.';
base.options.addUserTeam = 'Ajouter un joueur à votre équipe.';
base.options.updateTeam = 'Modifier votre équipe.';
base.options.removeUserTeam = 'Retirer un joueur de votre équipe.';
base.options.nameTeam = `Nom de l'équipe, ${maxLengthTeamName} caractères maximum.`;
base.options.accessTeam = 'Autoriser l\'ensemble des utilisateurs discord à afficher les statistiques de votre équipe.';
base.options.excludedSteamParameters = 'Exclure des joueurs de la recherche. (steam_parameters)';
base.options.excludedFaceitParameters = 'Exclure des joueurs de la recherche. (faceit_parameters)';
base.options.discordUserLink = 'Associer uniquement sur ce serveur. (Gestion des rôles requise pour associer un autre utilisateur).';
base.options.nicknameLink = 'Mettre à jour le pseudo discord avec le pseudo faceit. (Fonctionne uniquement si non admin)';
base.options.eloRoleName = 'Nom qui sera attribué au rôle';
base.options.eloRoleColor = 'Couleur qui sera attribuée au rôle (HEX, ex : #FF0000)';
base.options.eloRoleMin = 'Elo minimum requis pour obtenir le rôle (inclus)';
base.options.eloRoleMax = 'Elo maximum requis pour obtenir le rôle (inclus)';
base.options.setupEloRoles = 'Génère un rôle qui sera assigné aux utilisateurs en fonction de la plage elo choisie';
base.options.removeEloRole = 'Supprime le rôle sélectionné du serveur';
base.options.eloRole = '@rôle';
base.options.gameParameter = 'Jeu d\'où proviennent les statistiques (par défaut : CS2)';
base.strings.selectTeam = 'Sélectionner une équipe.';
base.strings.infoTeam = 'Afficher les informations de l\'équipe {teamName}.';
base.strings.voteDescription = 'Hey {discord} tu peux m\'aider à grandir en votant pour moi sur top.gg !';
base.strings.messageProcessing = 'Votre demande est en cours de traitement...';
base.strings.error = 'Erreur';
base.strings.info = 'Infos';
base.strings.compare = 'Comparaison entre {playerName1} et {playerName2}.';
base.strings.matchPlayed = '{matchNumber} parties jouées.';
base.strings.selectDate = 'Sélectionner une date.';
base.strings.helpInfo = 'Informations sur la commande **{command}** \n `<>` = Optionnel, `[]` = Obligatoire, `{}` = Requis si compte discord non associé';
base.strings.noOptions = 'Cette commande ne nécessite pas d\'options.';
base.strings.commands = 'Commandes';
base.strings.help = 'Aide';
base.strings.helpDescription = '`/help <command>` pour plus d\'informations sur une commande.';
base.strings.stats = 'Statistiques';
base.strings.system = 'Système';
base.strings.utility = 'Utilitaire';
base.strings.description = 'Description';
base.strings.options = 'Options';
base.strings.usage = 'Utilisation';
base.strings.example = 'Exemple';
base.strings.creator = 'Créateur';
base.strings.invitationLink = 'Inviter le bot sur ton serveur';
base.strings.voteLink = 'Voter pour le bot';
base.strings.serverLink = 'Rejoindre le serveur de support';
base.strings.accountLinked = 'Compte discord associé';
base.strings.invite = 'Invitation';
base.strings.inviteDescription = `Hey {discord} tu peux m\'inviter sur ton serveur en cliquant sur le lien ci-dessous !\n ${invite}`;
base.strings.join = 'Rejoindre';
base.strings.joinDescription = `Hey {discord} tu peux rejoindre le serveur de support en cliquant sur le lien ci-dessous !\n ${join}`;
base.strings.selectMatchBelow = 'Sélectionner l\'une des parties ci-dessous.';
base.strings.lastMatchLabel = 'Statistiques de la dernière partie.';
base.strings.lastMatchDescription = 'Informations sur la dernière partie.';
base.strings.selectAnotherMatch = 'Sélectionner une autre partie.';
base.strings.lastStatsLabel = 'Statistiques des dernières parties.';
base.strings.selectMap = 'Sélectionner une map.';
base.strings.selectMapDescription = 'Sélectionner l\'une des maps ci-dessous pour obtenir les statistiques associées (**{playerName}**).';
base.strings.selectWeek = 'Sélectionner une semaine.';
base.strings.year = 'Année';
base.strings.selectYear = 'Sélectionner une année.';
base.strings.selectMonth = 'Sélectionner un mois.';
base.strings.loading = 'Chargement';
base.strings.pagination = {
  prev: 'Page Précédente',
  next: 'Page Suivante',
  first: 'Première Page',
  last: 'Dernière Page'
};
base.strings.donate = 'Soutenir le projet';
base.strings.fullHistory = 'Historique complet';
base.strings.verifyDescription = `Hey {discord}, afin de vérifier ton compte faceit cliques sur le lien ci-dessous !\n${oauth2}\nUne fois ton compte vérifié, tu pourras obtenir le rôle lié, et plus encore !`;
base.strings.verify = 'Vérification';
base.strings.allMaps = 'Toutes les maps';
// Radar chart 
base.strings.allMapsDescription = 'Aperçu des statistiques des différentes maps';
base.strings.premiumDesc = 'Cette fonctionnalité est réservée aux guildes premium. Afin de profiter de cette fonctionnalité, fais évoluer ta guilde en premium en cliquant sur le bouton ci-dessous !';
base.error.user.missing = 'Il semblerait qu\'un des utilisateurs soit introuvable.';
base.error.user.compareSame = 'Vous ne pouvez pas comparer le même utilisateur.';
base.error.user.excluded = 'Vous ne pouvez pas exclure un utilisateur que vous avez déjà inclus.';
base.error.user.teamOwn = 'Vous ne possédez pas d\'équipe.';
base.error.user.noTeam = 'Vous ne possédez et ne faites partie d\'aucune équipe.';
base.error.user.teamFull = 'Vous ne pouvez pas ajouter plus de 5 joueurs à votre équipe.';
base.error.user.alreadyInTeam = '**{playerName}** fait déjà partie de l\'équipe **{teamName}**.';
base.error.user.notInTeam = '**{playerName}** n\'est pas dans l\'équipe **{teamName}**.';
base.error.user.permissions = { manageRoles: 'Vous n\'avez pas la permission de gérer les rôles.' };
base.error.user.notLinked = '{discord} n\'est pas associé à un compte faceit.';
base.error.user.noParametersNoLink = 'Merci de renseigner un utilisateur ou une équipe.\nVous pouvez également lier votre compte discord à votre compte faceit afin d\'obtenir vos statistiques directement.\nPour plus d\'informations, tapez la commande `/help command: link`.';
base.error.user.noMatches = 'Aucune partie n\'a été trouvée pour le joueur **{playerName}**.';
base.error.user.lastMatchNoStats = 'Impossible de récupérer les statistiques de la dernière partie de **{playerName}**.';
base.error.user.noMatchFoundWithOthers = 'Aucune partie n\'a été trouvée où **{playerName}** est présent avec les joueurs demandés.';
base.error.user.noBotLink = 'Désolé, mais les bots ne sont pas vraiment mon type...';
base.error.user.globalLink = '{discord} est déjà associé à un compte faceit de façon globale.';
base.error.user.notFound = 'L\'utilisateur demandé n\'est pas présent sur ce serveur.';
base.error.user.mapNotPlayed = 'Le joueur **{playerName}** n\'a pas joué cette carte.';
base.error.user.unlink.verified = `Votre compte est vérifié, vous devez supprimer l\'association sur le site web, cliquez sur le lien ci-dessous pour le faire\n${unlinkVerified}`;
base.error.user.link.verified.other = `Ce compte est vérifié, l'utilisateur devra sélectionner la guilde sur le site pour la lier\n${linkVerified}`
base.error.execution.command = 'Une erreur est survenue lors de l\'exécution de la commande.';
base.error.execution.selectmenu = 'Une erreur est survenue lors de l\'exécution du menu déroulant.';
base.error.execution.button = 'Une erreur est survenue lors de l\'exécution du bouton.';
base.error.execution.contextmenu = 'Une erreur est survenue lors de l\'exécution du menu contextuel.';
base.error.bot.channelNotAccessible = 'Je n\'ai pas la permission d\'envoyer des messages dans ce salon.';
base.error.bot.messageEvent = 'Merci d\'utiliser les commandes slash (/).';
base.error.bot.manageRoles = 'Je n\'ai pas la permission de gérer les rôles.';
base.error.command.notFound = 'Commande introuvable.';
base.error.command.teamNameAlreadyExist = 'Une équipe avec ce nom existe déjà.';
base.error.command.teamNameTooLong = `Le nom de l'équipe ne peut pas dépasser ${maxLengthTeamName} caractères.`;
base.error.command.alreadyOwnTeam = 'Vous possédez déjà l\'équipe **{teamName}**.';
base.error.command.invalidRoles = 'Un ou plusieurs rôles sont invalides.';
base.error.command.roleTooHigh = 'Ce rôle est plus élevé que celui du bot, merci de le déplacer plus bas.';
base.error.command.teamNotFound = 'Cette équipe n\'existe pas.';
base.error.command.teamEmpty = 'Cette équipe ne possède aucun membre.';
base.error.command.teamNoAccess = 'Vous n\'avez pas accès à cette équipe.';
base.error.command.faceitProfileNotFound = 'Profil faceit non trouvé';
base.error.command.faceitDatasNotFound = 'Données faceit non trouvées';
base.error.command.faceitCsgoStatsNotFound = 'Statistiques faceit CS non trouvées';
base.error.command.faceitHistoryNotFound = 'Historique faceit non trouvé';
base.error.command.faceitMatchStatsNotFound = 'Statistiques du match faceit non trouvées';
base.error.command.faceitLadderNotFound = 'Classement faceit non trouvé';
base.error.command.steamIdInvalid = 'Identifiant Steam invalide';
base.error.command.invalidColor = 'La couleur choisie n\'est pas valide, merci d\'utiliser le format HEX';
base.error.command.invalidElo = 'L\'elo minimum ne peut pas être supérieur à l\'elo maximum';
base.error.command.invalidRole = 'Le rôle sélectionné n\'est pas valide (Il doit correspondre à un rôle mentionné ou à un identifiant de rôle, et le rôle choisi doit être inférieur à celui du bot)';
base.error.command.requiredParameters = 'Les options suivantes sont obligatoires :  **{parameters}**\n Pour plus d\'informations tapez la commande : `/help command: {command}`';
base.error.command.atLeastOneParameter = 'Au moins l\'une des options suivantes est requise : **{parameters}**\n Pour plus d\'informations tapez la commande :  `/help command: {command}`';
base.success.command.removeRoles = 'Les rôles ont été supprimés avec succès.';
base.success.command.generateRoles = 'Les rôles ont été générés avec succès.';
base.success.command.setupRoles = 'Les rôles ont été configurés avec succès.';
base.success.command.removeTeam = 'Votre équipe **{teamName}** a été supprimée avec succès.';
base.success.command.updateTeam = 'Votre équipe **{teamName}** a été mise à jour.';
base.success.command.createTeam = 'Votre équipe **{teamName}** a été créée.';
base.success.command.removeUser = 'Le joueur **{playerName}** a été retiré de l\'équipe **{teamName}**.';
base.success.command.addUser = 'Le joueur **{playerName}** a été ajouté à l\'équipe **{teamName}**.';
base.success.command.unlink = {
  global: 'Toutes les associations ont été supprimées.',
  server: 'L\'association faite sur ce serveur a été supprimée.'
};
base.success.command.link = '{discord} a été associé à **{playerName}**.';
base.success.command.setupEloRoles = 'Le rôle elo a été généré avec succès';
base.success.command.removeRole = 'Le rôle a été supprimé avec succès';
module.exports = base;
