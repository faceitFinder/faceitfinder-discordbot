# FaceitFinder
## _Discord Bot which permit to find a faceit profile & its stats from a Steam id_
 [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.com/) [![Docker](https://badgen.net/badge/icon/docker?icon=docker&label)](https://docker.com/) [![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg)](https://gitmoji.dev/) 
 
## Features

- Retrieve a Faceit account using a Steam ID, Steam UID, Steam profile link, in-game status or by mentioning  a Discord user who has linked to a Faceit account.
- Get an elo graph.
- Get statistics from the last game.
- Link a Discord account whith a Faceit profile to get his statistics easily.

## Development

Want to contribute? Great!

### Installation

**Clone the repository:**

```sh
git clone git@github.com:JustDams/faceitFinder.git
cd faceitFinder
```

Rename the `.env.example` to `.env` and complete/update it with yours informations.

**Run docker on a dev environment:**

```sh
docker-compose -f docker-compose.dev.yml up
```

**Run linter:**

```sh
docker exec -it faceitfinder_dev npm run lint
```

**Run docker on a prod environment:**

```sh
docker-compose -f docker-compose.prod.yml up
```

## License

**ISC**
