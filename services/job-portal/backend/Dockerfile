# Stage 1
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

RUN pnpm run build

# Stage 2: Production environment
FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --ignore-scripts

# Copy compiled code from the builder stage
COPY --from=builder /app/build ./build

# Expose the default port
ENV PORT=5000
EXPOSE 5000

# Start the application
CMD ["pnpm", "start"]