const { maxLengthTeamName } = require('../config.json')
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
base.options.commandeName = 'Nom de la commande à afficher.'
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

base.strings.selectTeam = 'Selectionner une équipe.'
base.strings.infoTeam = 'Afficher les informations de l\'équipe {teamName}.'
base.strings.messageProcessing = 'Votre demande est en cours de traitement...'
base.strings.error = 'Erreur'

base.error.user.missing = 'Il semblerait qu\'un des utilisateurs soit introuvable.'
base.error.user.compareSame = 'Vous ne pouvez pas comparer le même utilisateur.'
base.error.user.alreadyInTeam = '**{playerName}** est déjà dans l\'équipe **{teamName}**.'
base.error.user.notLinked = 'Aucun compte faceit n\'est lié à votre compte discord.'
base.error.user.noParametersNoLink = 'Merci de renseigner un utilisateur ou une équipe.\n\
Vous pouvez également lier votre compte discord à votre compte faceit afin d\'obtenir vos statistiques directement.\n\
Pour plus d\'informations, tapez la commande `/help command: link`.'

base.error.execution.command = 'Une erreur est survenue lors de l\'exécution de la commande.'

base.success.command.removeUser = 'Le joueur **{playerName}** a été retiré de l\'équipe **{teamName}**.'
base.success.command.createTeam = 'L\'équipe **{teamName}** a été créée.'
base.success.command.deleteTeam = 'L\'équipe **{teamName}** a été supprimée.'
base.success.command.addUser = 'Le joueur **{playerName}** a été ajouté à l\'équipe **{teamName}**.'
base.success.command.updateTeam = 'L\'équipe **{teamName}** a été mise à jour.'
base.success.command.unlink = {
  global: 'Toutes les associations ont été supprimées.',
  server: 'L\'association faites sur ce serveur a été supprimée.',
}
base.success.command.link = '{discord} a été associé à {playerName}.'

module.exports = base