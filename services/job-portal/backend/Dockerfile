# Stage 1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled code from the builder stage
COPY --from=builder /app/build ./build

# Expose the default port
ENV PORT=5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
