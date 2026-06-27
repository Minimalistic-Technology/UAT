FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies) to enable tsc and prisma build tooling
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

# Generate prisma client types and compile TypeScript to JS (dist)
RUN pnpm dlx prisma generate && pnpm run build

# Prune dev dependencies to reduce build size of final image
RUN pnpm prune --prod

ENV NODE_ENV=production
ENV PORT=5001
EXPOSE 5001

CMD ["node", "dist/server.js"]
