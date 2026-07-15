FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application source
COPY . .

# Generate Prisma Client
RUN pnpm run db:generate

# Build the application
RUN pnpm run build

# Expose application port
ENV PORT=5000
EXPOSE 5000

# Start the application
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]