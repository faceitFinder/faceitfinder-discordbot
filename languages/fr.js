const { maxLengthTeamName, invite } = require('../config.json')
const base = structuredClone(require('./base'))

base.command.compare.description = 'Comparer les statistiques des 2 joueurs.'
base.command.dailystats.description = 'Obtenir les statistiques du jour selectionné, accompagné d\'un graphique de l\'évolution de l\'elo.'
base.command.find.description = 'Trouver les parties qui contiennent les joueurs demandés (jusqu\'à 5).'
base.command.help.description = 'Obtenir la liste des commandes.'
base.command.info.description = 'Obtenir des informations sur le bot.'
base.command.invite.description = 'Obtenir le lien pour inviter le bot sur votre serveur.'
base.command.join.description = 'Obtenir le lien pour rejoindre le serveur communautaire du bot.'
base.command.last.description = 'Obtenir les statistiques de la dernière partie.'
base.command.laststats.description = 'Obtenir les statistiques des x dernières parties, accompagné d\'un graphique de l\'évolution de l\'elo.'
base.command.link.description = 'Associer un profil faceit à un utilisateur discord, pour obtenir vos statistiques directement.'
base.command.map.description = 'Obtenir les statistiques de la map selectionnée.'
base.command.monthstats.description = 'Obtenir les statistiques du mois selectionné, accompagné d\'un graphique de l\'évolution de l\'elo.'
base.command.roles.description = 'Les rangs sont mis à jour toutes les heures et quand vous obtenez vos statistiques.'
base.command.stats.description = 'Obtenir les statistiques générales, accompagné d\'un graphique de l\'évolution de l\'elo.'
base.command.team.description = 'Créer une équipe et lier jusqu\'à 5 utilisateurs à celle-ci (limite d\'une équipe par compte discord).'
base.command.unlink.description = 'Supprimer l\'association entre votre compte discord et votre profil faceit.'
base.command.vote.description = 'Obtenir le lien pour voter pour le bot sur top.gg.'
base.command.weekstats.description = 'Obtenir les statistiques de la semaine selectionnée, accompagné d\'un graphique d\'évolution de l\'elo.'
base.command.yearstats.description = 'Obtenir les statistiques de l\'année selectionnée, accompagné d\'un graphique d\'évolution de l\'elo.'

base.options.matchNumber = 'Nombre de parties à afficher, par défaut 20.'
base.options.steamParameter = 'steamID / steamID personnalisé / url profil steam / @utilisateur / status CSGO.'
base.options.faceitParameter = 'pseudo faceit / @utilisateur / url profil faceit.'
base.options.steamParameters = 'steamIDs / steamIDs personnalisés / url profils steam / @utilisateurs / status CSGO.'
base.options.faceitParameters = 'pseudos faceit / @utilisateurs / url profils faceit.'
base.options.teamParameter = 'slug d\'une équipe (vous devez en faire partie, être le créateur, ou que l\'équipe soit publique).'
base.options.fromDate = 'INCLUS. Date de début au format MM/JJ/AAAA.'
base.options.toDate = 'EXCLUS. Date de fin au format MM/JJ/AAAA, par défaut la date du jour, 1 jour d\'écart minimum.'
base.options.playerAimed = 'steam_parameter / faceit_parameter / @user / vide (pour vous-même si lié).'
base.options.globalUnlink = 'Supprimer l\'ensemble des associations faites avec votre compte discord.'
base.options.commandName = 'Nom de la commande à afficher.'
base.options.mapName = 'Selectionner une map pour obtenir les statistiques associées.'
base.options.levelRoles = {
  1: 'Role associé au niveau 1.',
  2: 'Role associé au niveau 2.',
  3: 'Role associé au niveau 3.',
  4: 'Role associé au niveau 4.',
  5: 'Role associé au niveau 5.',
  6: 'Role associé au niveau 6.',
  7: 'Role associé au niveau 7.',
  8: 'Role associé au niveau 8.',
  9: 'Role associé au niveau 9.',
  10: 'Role associé au niveau 10.',
}
base.options.removeOldRoles = 'Supprimer les anciens roles, si existants.'
base.options.generateRoles = 'Générer les roles.'
base.options.setupRoles = 'Configurer les roles.'
base.options.removeRoles = 'Supprimer les roles.'
base.options.infoTeam = 'Afficher les informations des équipes dans lesquelles vous êtes.'
base.options.createTeam = 'Créer votre équipe.'
base.options.deleteTeam = 'Supprimer votre équipe.'
base.options.addUserTeam = 'Ajouter un joueur à votre équipe.'
base.options.removeUserTeam = 'Retirer un joueur de votre équipe.'
base.options.nameTeam = `Nom de l'équipe, ${maxLengthTeamName} caractères maximum.`
base.options.accessTeam = 'Autoriser l\'ensemble des utilisateurs discord à afficher les statistiques de votre équipe.'
base.options.excludedFaceitParameters = 'Exclure des joueurs de la recherche. (faceit_parameters)'
base.options.excludedSteamParameters = 'Exclure des joueurs de la recherche. (steam_parameters)'
base.options.discordUserLink = 'Associer uniquement sur ce serveur. (Gestion des rôles requise pour associer un autre utilisateur).'
base.options.nicknameLink = 'Mettre à jour le pseudo discord avec le pseudo faceit. (Fonctionne uniquement si non admin)'

base.strings.selectTeam = 'Selectionner une équipe.'
base.strings.infoTeam = 'Afficher les informations de l\'équipe {teamName}.'
base.strings.voteDescription = 'Hey {discord} tu peux m\'aider à grandir en votant pour moi sur top.gg !'
base.strings.messageProcessing = 'Votre demande est en cours de traitement...'
base.strings.error = 'Erreur'
base.strings.info = 'Info'
base.strings.compare = 'Comparaison entre {player1} et {player2}.'
base.strings.matchPlayed = '{matchNumber} parties jouées.'
base.strings.selectDate = 'Selectionner une date.'
base.strings.helpInfo = 'Informations sur la commande **{command}** \n \`<>\` = Optionnel, \`[]\` = Obligatoire, \`{}\` = Requis si compte discord non associé'
base.strings.noOptions = 'Cette commande ne nécessite pas d\'options.'
base.strings.commands = 'Commandes'
base.strings.help = 'Aide'
base.strings.helpDescription = '`/help <command>` pour plus d\'informations sur une commande.'
base.strings.stats = 'Statistiques'
base.strings.system = 'Système'
base.strings.utility = 'Utilitaire'
base.strings.description = 'Description'
base.strings.options = 'Options'
base.strings.usage = 'Utilisation'
base.strings.example = 'Exemple'
base.strings.creator = 'Créateur'
base.strings.invitationLink = 'Lien d\'invitation'
base.strings.voteLink = 'Lien de vote'
base.strings.serverLink = 'Lien du serveur'
base.strings.accountLinked = 'Compte discord associé'
base.strings.invite = 'Invitation'
base.strings.inviteDescription = `Hey {discord} tu peux m\'inviter sur ton serveur en cliquant sur le lien ci-dessous !\n ${invite}`

base.error.user.missing = 'Il semblerait qu\'un des utilisateurs soit introuvable.'
base.error.user.compareSame = 'Vous ne pouvez pas comparer le même utilisateur.'
base.error.user.excluded = 'Vous ne pouvez pas exclure un utilisateur que vous avez déjà inclus.'
base.error.user.teamOwn = 'Vous ne possédez pas d\'équipe.'
base.error.user.noTeam = 'Vous ne possédez et ne faites partie d\'aucune équipe.'
base.error.user.alreadyInTeam = '**{playerName}** fait déjà parti de l\'équipe **{teamName}**.'
base.error.user.notInTeam = '**{playerName}** n\'est pas dans l\'équipe **{teamName}**.'
base.error.user.permissions = {
  manageRoles: 'Vous n\'avez pas la permission de gérer les rôles.',
}
base.error.user.notLinked = 'Aucun compte faceit n\'est lié à votre compte discord.'
base.error.user.noParametersNoLink = 'Merci de renseigner un utilisateur ou une équipe.\n\
Vous pouvez également lier votre compte discord à votre compte faceit afin d\'obtenir vos statistiques directement.\n\
Pour plus d\'informations, tapez la commande `/help command: link`.'
base.error.user.noMatches = 'Aucune partie n\'a été trouvée pour le joueur {playerName}.'

base.error.execution.command = 'Une erreur est survenue lors de l\'exécution de la commande.'
base.error.execution.selectmenu = 'Une erreur est survenue lors de l\'exécution du menu déroulant.'
base.error.execution.button = 'Une erreur est survenue lors de l\'exécution du bouton.'
base.error.execution.contextmenu = 'Une erreur est survenue lors de l\'exécution du menu contextuel.'

base.error.bot.channelNotAccessible = 'Je n\'ai pas la permission d\'envoyer des messages dans ce salon.'
base.error.bot.messageEvent = 'Merci d\'utiliser les commandes slash (/).'
base.error.bot.manageRoles = 'Je n\'ai pas la permission de gérer les rôles.'

base.error.command.notFound = 'Commande introuvable.'
base.error.command.teamNameAlreadyExist = 'Une équipe avec ce nom existe déjà.'
base.error.command.teamNameTooLong = `Le nom de l'équipe ne peut pas dépasser ${maxLengthTeamName} caractères.`
base.error.command.alreadyOwnTeam = 'Vous possédez déjà l\'équipe **{teamName}**.'

base.success.command.removeRoles = 'Les rôles ont été supprimés avec succès.'
base.success.command.removeTeam = 'Votre équipe **{teamName}** a été supprimée avec succès.'
base.success.command.updateTeam = 'Votre équipe **{teamName}** a été mise à jour.'
base.success.command.createTeam = 'Votre équipe **{teamName}** a été créée.'
base.success.command.removeUser = 'Le joueur **{playerName}** a été retiré de l\'équipe **{teamName}**.'
base.success.command.addUser = 'Le joueur **{playerName}** a été ajouté à l\'équipe **{teamName}**.'
base.success.command.unlink = {
  global: 'Toutes les associations ont été supprimées.',
  server: 'L\'association faites sur ce serveur a été supprimée.',
}
base.success.command.link = '{discord} a été associé à {playerName}.'

module.exports = base