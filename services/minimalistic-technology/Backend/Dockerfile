# Stage 1: Build Stage (Builder)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies required for typescript compilation)
RUN npm ci

# Copy the source code
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build


# Stage 2: Production Stage (Optimized minimal image)
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Set node environment to production for optimization
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies to keep the image lightweight and secure
RUN npm ci --omit=dev

# Copy the compiled output folder from Stage 1
COPY --from=builder /usr/src/app/build ./build

# Expose the backend port
EXPOSE 5000

# Run the application directly with Node for better performance
CMD ["node", "build/server.js"]
