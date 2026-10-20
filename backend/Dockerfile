FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

COPY prisma.config.ts ./

RUN npm ci

COPY src ./src

RUN mkdir -p storage/documents storage/imports storage/exports

EXPOSE 5000

CMD ["node", "src/server.js"]