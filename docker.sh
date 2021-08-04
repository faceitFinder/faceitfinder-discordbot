docker build -t faceitfinder .
docker run -d --env-file .env.local faceitfinder
