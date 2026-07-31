FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies for building)
RUN pnpm install

# Copy source code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --ignore-scripts

# Copy the built output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the default port
ENV PORT=3000
EXPOSE 3000

# Start the Next.js application
CMD ["pnpm", "start"]