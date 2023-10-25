
# For development
FROM node:18.13.0-slim AS development

WORKDIR /app

ENV PORT=2960

ENV NODE_ENV=development

COPY ./package.json ./yarn.lock ./

RUN yarn

COPY . .

CMD [ "yarn", "start:dev"]

# For building dist
FROM node:18.13.0-slim AS build

ENV PORT=2960

ENV NODE_ENV=production

WORKDIR /app

COPY ./package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build  

# For production
FROM node:18.13.0-slim AS production

ARG component=lms-clone

ARG user=${component}

ARG uid=1001

ARG gid=$uid

WORKDIR /app

COPY --from=build ./app/package.json ./app/yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn rm -rf node_modules && YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile --production

COPY --from=build ./app/dist ./

RUN apt-get update -y \
    && apt-get install -y openssl

# change ownership of the workspace directory
RUN groupadd --gid ${gid} ${user} \
    && useradd --uid ${uid} --gid ${gid} -m ${user} \
    && chown -R ${uid}:${gid} /app

USER ${user} 

ENV PORT=2960

ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "main.js"]