# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Build the Next.js app
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
# If you have next.config.js/ts, you might need to copy it here
# COPY --from=builder /usr/src/app/next.config.* ./ 

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
