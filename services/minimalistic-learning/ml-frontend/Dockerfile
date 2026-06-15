# ── STAGE 1: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js static export
RUN npm run build


# ── STAGE 2: Runner ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copy minimum required public assets
COPY --from=builder /app/public ./public

# Copy the standalone server output
COPY --from=builder /app/.next/standalone ./

# Copy the static folder to the standalone directory (.next/static)
COPY --from=builder /app/.next/static ./.next/static

# Expose port 3000
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
