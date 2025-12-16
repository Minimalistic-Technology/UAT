FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src
RUN npm install typescript ts-node-dev @types/node @types/express --save-dev && npm run build

ENV NODE_ENV=production
ENV PORT=5002
EXPOSE 5002

CMD ["node", "dist/server.js"]
