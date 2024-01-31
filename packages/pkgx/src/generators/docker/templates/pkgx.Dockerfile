# node v18.17.1, npm v9.6.7
FROM node:18.17.1-alpine@sha256:3482a20c97e401b56ac50ba8920cc7b5b2022bfc6aa7d4e4c231755770cf892f AS base

WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache bash
RUN apk add --no-cache busybox-extras
RUN apk add --no-cache curl

RUN npm config set registry=https://registry.npmmirror.com \
  && npm install -g pm2

FROM base AS pnpm-env

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM pnpm-env AS build

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ARG APP_NAME

RUN pnpm nx run ${APP_NAME}:build

FROM pnpm-env AS app-deps

ARG APP_FOLDER

COPY apps/${APP_FOLDER}/lib[s] ./libs
COPY --from=build /app/apps/${APP_FOLDER}/output/package.json ./package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM base AS prod

ENV NODE_ENV production
ENV APP_ENV production

COPY --from=app-deps /app/node_modules ./node_modules

ARG APP_FOLDER

COPY --from=build /app/apps/${APP_FOLDER}/node_modules/@blastz/prisma-clien[t] ./node_modules/@blastz/prisma-client
COPY --from=build /app/apps/${APP_FOLDER}/output/. .

CMD pm2-runtime --raw esm/index.js