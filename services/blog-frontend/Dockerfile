FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@10.33.4

# Install app dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy application source and build
COPY . .

ARG NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
