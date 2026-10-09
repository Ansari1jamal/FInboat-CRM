FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

COPY prisma.config.ts ./

RUN npx prisma generate

COPY src ./src

RUN mkdir -p storage/documents storage/imports storage/exports

EXPOSE 5000

CMD ["node", "src/server.js"]