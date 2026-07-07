# Stage 1
FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for prisma engine
RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

# Generate Prisma client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm run db:generate

RUN pnpm run build

# Stage 2: Production environment
FROM node:20-slim

WORKDIR /app

# Install openssl for prisma engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm prisma
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --ignore-scripts

# Copy prisma schema and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" prisma generate

# Copy compiled code from the builder stage
COPY --from=builder /app/build ./build

# Expose the default port
ENV PORT=5000
EXPOSE 5000

# Start the application by applying migrations and then running node
CMD ["sh", "-c", "prisma migrate deploy && pnpm start"]