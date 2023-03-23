# FaceitFinder
## _Discord Bot which permit to find a faceit profile & its stats from different parameters_
 [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.com/) [![Docker](https://badgen.net/badge/icon/docker?icon=docker&label)](https://docker.com/)
 
## Features

- Retrieve a Faceit account using a **Steam ID**, **Steam UID**, **Steam profile link**, **in-game status**, **Faceit username** or by **mentioning a Discord user** who has linked to a Faceit account.

## Development

Want to contribute? Great!

### Run docker on a dev environment

**Clone the repository:**

```sh
git clone git@github.com:faceitFinder/faceitfinder-discordbot.git
cd faceitfinder-discordbot
```

**Setup env files:**

Copy the `.env.example` in `.env` and `.env.mongodb.example` in `.env.mongodb` then complete/update it with your information.

```sh
cp .env.example .env
cp .env.mongodb.example .env.mongodb
```

**Run compose:**

```sh
docker-compose -f docker-compose.dev.yml up
```

**To run the linter:**

```sh
docker exec -it faceitfinder_dev npm run lint-and-fix
```

### Run docker on a prod environment

**Clone the repository:**

```sh
git clone git@github.com:faceitFinder/faceitfinder-discordbot.git
cd faceitfinder-discordbot
```

**Got to the prod branch:**

```sh
git checkout prod
```

**Setup env files:**

Copy the `.env.example` in `.env` and `.env.mongodb.example` in `.env.mongodb` then complete/update it with your information.

```sh
cp .env.example .env
cp .env.mongodb.example .env.mongodb
```

**Run compose:**

```sh
docker-compose -f docker-compose.prod.yml up --build -d
```

## License

**ISC**
