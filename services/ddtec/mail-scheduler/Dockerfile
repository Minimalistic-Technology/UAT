FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=6100
ENV DB_PATH=/usr/src/app/data/mail-scheduler.db

# better-sqlite3 needs to compile a native addon at install time
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p /usr/src/app/data

EXPOSE 6100

CMD ["node", "src/server.js"]
