FROM node:22-bookworm-slim AS base

WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY .env.example ./.env.example

RUN npx prisma generate
RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npm start"]
