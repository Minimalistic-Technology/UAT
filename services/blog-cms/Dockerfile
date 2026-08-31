# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /opt/app

# better-sqlite3 and the admin panel's image processing need these to build on alpine
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git python3

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

RUN apk add --no-cache vips-dev

WORKDIR /opt/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/src ./src
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/database ./database
COPY --from=builder /opt/app/favicon.png ./favicon.png
COPY --from=builder /opt/app/tsconfig.json ./tsconfig.json

# Persist uploaded media / the sqlite file outside the container.
VOLUME ["/opt/app/.tmp", "/opt/app/public/uploads"]

EXPOSE 1337

CMD ["npm", "run", "start"]
