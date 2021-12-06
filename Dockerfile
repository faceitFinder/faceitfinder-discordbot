FROM node:16.8.0

ENV APP /usr/src/app

RUN mkdir -p $APP
WORKDIR $APP

COPY package.json $APP
ARG NODE_ENV
RUN if [ ${NODE_ENV} = "dev" ]; then \
  npm install; else \
  npm install --only=production; \ 
  fi

COPY . $APP

CMD ["npm", "start"]