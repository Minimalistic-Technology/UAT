FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the default port
ENV PORT=3000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
