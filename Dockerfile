# Production dependencies only. canvas ships a prebuilt binary bundling its own cairo/pango
# libraries: no compiler nor -dev package is needed.
FROM node:24.14.0-slim AS deps

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --non-interactive && yarn cache clean

FROM node:24.14.0-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends fontconfig-config fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

USER node

CMD ["node", "index.js"]
