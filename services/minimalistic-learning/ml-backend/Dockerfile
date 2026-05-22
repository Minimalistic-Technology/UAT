FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies) to enable tsc and prisma build tooling
RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Generate prisma client types and compile TypeScript to JS (dist)
RUN npx prisma generate && npm run build

# Prune dev dependencies to reduce build size of final image
RUN npm prune --production

ENV NODE_ENV=production
ENV PORT=5001
EXPOSE 5001

CMD ["node", "dist/server.js"]
