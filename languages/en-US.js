const { maxLengthTeamName } = require('../config.json')

module.exports = {
  commande: {
    compare: {
      description: 'Compare both user stats.',
    },
    dailystats: {
      description: 'Displays the stats of the choosen day. With elo graph of the day.',
    },
    find: {
      description: 'Find the games that includes the player requested (up to 5), last 1000 games.',
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
      description: 'Get the link to join the community server of the bot .',
    },
    last: {
      description: 'Get the stats of last game.',
    },
    laststats: {
      description: 'Displays the stats of the x last match. With elo graph of the x last match.',
    },
    link: {
      description: 'Link a steam profile to the discord user, to get your stats directly (no parameters needed).',
    },
    map: {
      description: 'Displays the stats of the choosen map.',
    },
    monthstats: {
      description: 'Displays the stats of the choosen month. With elo graph of the month.',
    },
    roles: {
      description: 'Ranks are updated every hour and when you get your personnal stats.',
    },
    stats: {
      description: 'Displays general stats. With elo graph of the 20 last games.',
    },
    team: {
      description: 'Create a team and link up to 5 users to it (limited to 1 team by discord account).',
    },
    unlink: {
      description: 'Unlink your faceit id from the discord bot.',
    },
    vote: {
      description: 'Get the link to vote for the bot on top.gg',
    },
    weekstats: {
      description: 'Displays the stats of the choosen week. With elo graph of the week.',
    },
    yearstats: {
      description: 'Displays the stats of the choosen year. With elo graph of the year.',
    }
  },
  options: {
    match_number: {
      description: 'Number of matches to display. Default: 20'
    },
    steam_parameter: {
      description: 'steamID / steam custom ID / url of one steam profile / @user / CSGO status.'
    },
    faceit_parameter: {
      description: 'faceit nickname / @user'
    },
    steam_parameters: {
      description: 'steamIDs / steam custom IDs / url of one or more steam profiles / @users / CSGO status.'
    },
    faceit_parameters: {
      description: 'faceit nicknames / @users'
    },
    team: {
      description: 'team slug (you need to be a part of it, the creator, or it has to be public)'
    },
    from_date: {
      description: 'INCLUDED. Start date, format MM/DD/YYYY'
    },
    to_date: {
      description: 'EXCLUDED. End date (at least 1 day interval), if empty gets the current day. Format MM/DD/YYYY'
    },
    player_aimed: {
      description: 'steam_parameters / faceit_parameters / @user / empty if linked.'
    },
    global: {
      description: 'This will unlink your account on all servers (False by default)'
    },
    commande: {
      description: 'The name of one command.'
    },
    map: {
      description: 'Specify a map to get the stats related'
    },
    level: {
      1: {
        description: 'The role for the level 1'
      },
      2: {
        description: 'The role for the level 2'
      },
      3: {
        description: 'The role for the level 3'
      },
      4: {
        description: 'The role for the level 4'
      },
      5: {
        description: 'The role for the level 5'
      },
      6: {
        description: 'The role for the level 6'
      },
      7: {
        description: 'The role for the level 7'
      },
      8: {
        description: 'The role for the level 8'
      },
      9: {
        description: 'The role for the level 9'
      },
      10: {
        description: 'The role for the level 10'
      },
    },
    remove_old: {
      description: 'Remove the old roles if they exist.'
    },
    generate: {
      description: 'Generates the rank roles on the server.'
    },
    setup: {
      description: 'Setup the roles that you want for each ranks on the server.'
    },
    remove: {
      description: 'Removes the rank roles on the server.'
    },
    info: {
      description: 'Get information about your team.'
    },
    create: {
      description: 'Create your team'
    },
    delete: {
      description: 'Delete your team'
    },
    update: {
      description: 'Update your team'
    },
    add_user: {
      description: 'Add a user to your team'
    },
    remove_user: {
      description: 'Remove a user from your team'
    },
    name: {
      description: `name of your team, up to ${maxLengthTeamName} characters`
    },
    access: {
      description: 'let others discord users access your team if they are not in the team'
    }
  }
}