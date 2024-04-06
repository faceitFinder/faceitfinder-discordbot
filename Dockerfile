FROM node:21-alpine

ARG APP=/usr/src/app

ENV NODE_ENV=
ENV TOKEN=
ENV FACEIT_TOKEN=
ENV STEAM_TOKEN=
ENV TOPGG_TOKEN=

RUN apk update && \
  apk add --no-cache \
  build-base \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  librsvg-dev


WORKDIR $APP
COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

CMD ["yarn", "start"]