FROM node:latest

ENV APP /usr/src/app

RUN mkdir -p $APP
WORKDIR $APP

COPY package.json $APP
RUN npm install

COPY . $APP

CMD ["npm", "start"]
