const { maxLengthTeamName, invite, join } = require('../config.json')

module.exports = {
  command: {
    compare: {
      description: 'Compare both user stats.',
    },
    dailystats: {
      description: 'Displays the stats of the choosen day, with elo graph of the day.',
    },
    find: {
      description: 'Find the games that includes the players requested (up to 5).',
    },
    help: {
      description: 'Display the command list.',
    },
    info: {
      description: 'Get the info about the bot.',
    },
    invite: {
      description: 'Get the link to invite the bot on your server.',
    },
    join: {
      description: 'Get the link to join the community server of the bot.',
    },
    last: {
      description: 'Get the stats of last game.',
    },
    laststats: {
      description: 'Displays the stats of the x last match, with elo graph of the x last match.',
    },
    link: {
      description: 'Link a faceit profile to the discord user, to get your stats directly (no parameters needed).',
    },
    map: {
      description: 'Displays the stats of the choosen map.',
    },
    monthstats: {
      description: 'Displays the stats of the choosen month, with elo graph of the month.',
    },
    roles: {
      description: 'Ranks are updated every hour and when you get your stats.',
    },
    stats: {
      description: 'Displays general stats, with elo graph of the 20 last games.',
    },
    team: {
      description: 'Create a team and link up to 5 users to it (limited to 1 team by discord account).',
    },
    unlink: {
      description: 'Unlink your faceit id from the discord bot.',
    },
    vote: {
      description: 'Get the link to vote for the bot on top.gg.',
    },
    weekstats: {
      description: 'Displays the stats of the choosen week, with elo graph of the week.',
    },
    yearstats: {
      description: 'Displays the stats of the choosen year, with elo graph of the year.',
    }
  },
  options: {
    matchNumber: 'Number of matches to display. Default: 20',
    steamParameter: 'steamID / steam custom ID / steam profile url / @user / CSGO status.',
    faceitParameter: 'faceit nickname / @user / faceit profile url.',
    steamParameters: 'steamIDs / steam custom IDs / steam profile urls / @users / CSGO status.',
    faceitParameters: 'faceit nicknames / @users / faceit profile urls.',
    faceitParametersTeam: 'faceit nicknames / @users / faceit profile urls. (Max 5)',
    steamParametersTeam: 'steamIDs / steam custom IDs / steam profile urls / @users / CSGO status. (Max 5)',
    teamParameter: 'team slug (you need to be a part of it, the creator, or it has to be public)',
    fromDate: 'INCLUDED. Start date, format MM/DD/YYYY',
    toDate: 'EXCLUDED. End date (at least 1 day interval), if empty gets the current day. Format MM/DD/YYYY',
    playerAimed: 'steam_parameters / faceit_parameters / @user / empty if linked.',
    globalUnlink: 'This will unlink your account on all servers (False by default)',
    commandName: 'The name of one command.',
    mapName: 'Specify a map to get the stats related.',
    levelRoles: {
      1: 'Level 1.',
      2: 'Level 2.',
      3: 'Level 3.',
      4: 'Level 4.',
      5: 'Level 5.',
      6: 'Level 6.',
      7: 'Level 7.',
      8: 'Level 8.',
      9: 'Level 9.',
      10: 'Level 10.'
    },
    removeOldRoles: 'Remove the old roles if they exist.',
    generateRoles: 'Generates the rank roles on the server.',
    setupRoles: 'Setup the roles that you want for each ranks on the server.',
    removeRoles: 'Removes the rank roles on the server.',
    infoTeam: 'Get information about your teams.',
    createTeam: 'Create your team',
    deleteTeam: 'Delete your team',
    updateTeam: 'Update your team',
    addUserTeam: 'Add a user to your team',
    removeUserTeam: 'Remove a user from your team',
    nameTeam: `name of your team, up to ${maxLengthTeamName} characters`,
    accessTeam: 'Allow every discord users to show your team statistics.',
    excludedSteamParameters: 'Exclude steam parameters from the search',
    excludedFaceitParameters: 'Exclude faceit parameters from the search',
    discordUserLink: 'Link the user only for this server. (Role management permissions to link someone else)',
    nicknameLink: 'Makes your discord nickname the same as your faceit nickname. (Only works with non admin users)',
  },
  strings: {
    selectTeam: 'Select a team',
    infoTeam: 'Get info about the team {teamName}.',
    voteDescription: 'Hey {discord} you can vote on top.gg to help me grow.',
    messageProcessing: 'Your request is currently processing..',
    error: 'Error',
    info: 'Info',
    compare: 'Comparison between {playerName1} and {playerName2}',
    matchPlayed: '{matchNumber} matches played',
    selectDate: 'Select a date',
    helpInfo: 'Information about the **{command}** command \n \`<>\`: Optional, \`[]\`: Required, \`{}\`: Required if not linked',
    noOptions: 'This command does not require any options',
    commands: 'Commands',
    help: 'Help',
    helpDescription: '`/help <command>` for more info on a specific command',
    stats: 'Stats',
    system: 'System',
    utility: 'Utility',
    description: 'Description',
    options: 'Options',
    usage: 'Usage',
    example: 'Example',
    creator: 'Creator',
    invitationLink: 'Invitation link',
    voteLink: 'Vote link',
    serverLink: 'Server link',
    accountLinked: 'Account linked',
    invite: 'Invite',
    inviteDescription: `Hey {discord} you can invite me by clicking on the following link!\n${invite}`,
    join: 'Join',
    joinDescription: `Hey {discord} you can join the support server by clicking on the following link!\n${join}`,
    selectMatchBelow: 'Select one of the matches below',
    lastMatchLabel: 'Last match stats info.',
    lastMatchDescription: 'Info about the last match.',
    selectAnotherMatch: 'Select another match',
    lastStatsLabel: 'Statistics of the last matches.',
    selectMap: 'Select a map',
    selectMapDescription: 'Select one of the following maps to get the statistics related (**{playerName}**)',
    selectWeek: 'Select a week',
    year: 'Year',
    selectYear: 'Select a year',
  },
  error: {
    user: {
      missing: 'It seems like there is a user missing.',
      compareSame: 'You can\'t compare the same user.',
      excluded: 'You can\'t exclude a player you are searching for.',
      teamOwn: 'You don\'t own a team.',
      noTeam: 'You don\'t own a team and you aren\'t part of any team',
      teamFull: 'You can\'t add more than 5 users to your team',
      alreadyInTeam: '**{playerName}** is already part of the team **{teamName}**',
      notInTeam: '**{playerName}** is not part of the team **{teamName}**',
      permissions: {
        manageRoles: 'You don\'t have the permission to manage roles',
      },
      notLinked: 'You are not linked to a faceit account.',
      noParametersNoLink: 'Please specify a user or a team.\n\
      You can also link your discord account with your faceit account to get your stats directly.\n\
      To know how to do it, type `/help command: link`.',
      noMatches: 'Couldn\'t find any matches for the player **{playerName}**',
      lastMatchNoStats: 'Couldn\'t find any stats for the last match of the player **{playerName}**',
      noMatchFoundWithOthers: 'Couldn\'t find any matches where **{playerName}** played with the requested players.',
      noBotLink: 'Sorry, but bots aren\'t really my type...',
      globalLink: '{discord} already has a global link.',
      notFound: 'The requested user is not on this server.',
    },
    execution: {
      command: 'An error occured while executing the command.',
      selectmenu: 'An error occured while executing the select menu.',
      button: 'An error occured while executing the button.',
      contextmenu: 'An error occured while executing the context menu.',
    },
    bot: {
      channelNotAccessible: 'I do not have the permission to send messages in this channel.',
      messageEvent: 'Please use the slash commands. (/)',
      manageRoles: 'I don\'t have the permission to manage roles',
    },
    command: {
      notFound: 'Command not found.',
      teamNameAlreadyExist: 'A team with this name already exists.',
      teamNameTooLong: `The team name is too long, it must be under ${maxLengthTeamName} characters.`,
      alreadyOwnTeam: 'You already own the team **{teamName}**',
      invalidRoles: 'One or more roles are invalid',
      roleTooHigh: 'This role is higher than the bot role, please place it below the bot role.',
    }
  },
  success: {
    command: {
      removeRoles: 'The roles have been removed successfully.',
      generateRoles: 'The roles have been generated successfully.',
      setupRoles: 'The roles have been setup successfully.',
      removeTeam: 'Your team **{teamName}** has been removed successfully.',
      updateTeam: 'Your team **{teamName}** has been updated.',
      createTeam: 'Your team **{teamName}** has been created.',
      removeUser: '**{playerName}** has been removed from the team **{teamName}**',
      addUser: '**{playerName}** has been added to the team **{teamName}**',
      unlink: {
        global: 'Your account has been unlinked successfully.',
        server: 'Your account has been unlinked successfully on this server.',
      },
      link: '{discord} has been linked to **{playerName}**'
    }
  }
}