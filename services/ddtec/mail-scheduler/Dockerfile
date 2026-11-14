# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# better-sqlite3 needs to compile a native addon at install time
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=6100
ENV DB_PATH=/usr/src/app/data/mail-scheduler.db

# better-sqlite3 needs to compile a native addon at install time
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

RUN mkdir -p /usr/src/app/data

EXPOSE 6100

CMD ["node", "dist/server.js"]
