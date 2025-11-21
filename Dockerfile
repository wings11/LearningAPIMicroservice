# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS build
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json vitest.config.ts ./
COPY src ./src
RUN npm run build

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY .env.example ./
EXPOSE 4100
CMD ["node", "dist/index.js"]
