FROM node:21

ARG APP=/usr/src/app

ENV NODE_ENV=
ENV TOKEN=
ENV TOPGG_TOKEN=

RUN apt-get update && apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev

WORKDIR $APP
COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

CMD ["yarn", "start"]
