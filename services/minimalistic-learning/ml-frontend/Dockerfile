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


# # ── STAGE 2: Serve with Nginx ──
# FROM nginx:alpine

# # Copy the custom Nginx configuration to handle SPA routing correctly
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy the static export (`out` directory) from builder
# COPY --from=builder /app/out /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]

EXPOSE 3000

CMD ["npm", "run", "start"]
