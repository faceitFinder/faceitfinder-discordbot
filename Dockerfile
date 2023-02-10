FROM node:17.9.0

ENV APP /usr/src/app

ENV NODE_ENV=
ENV TOKEN=
ENV FACEIT_TOKEN=
ENV STEAM_TOKEN=
ENV TOPGG_TOKEN=
ENV MONGO_URI=

RUN mkdir -p $APP
WORKDIR $APP

COPY package.json $APP

RUN npm install

COPY . $APP

CMD ["npm", "start"]
