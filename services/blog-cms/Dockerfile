FROM node:20-alpine

WORKDIR /opt/app

# Install system dependencies needed by Strapi & better-sqlite3
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git python3
RUN npm install -g pnpm@10.33.4

# Install app dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy application source and build
COPY . .
RUN pnpm run build

EXPOSE 1337

CMD ["pnpm", "run", "start"]
