FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY apps/server/package.json ./
COPY apps/server/prisma ./prisma
COPY packages/shared ./packages/shared

RUN npm install

COPY apps/server/src ./src
COPY apps/server/tsconfig.json ./

RUN npx prisma generate

RUN npm run build

EXPOSE 4000

CMD ["npx", "prisma", "migrate", "deploy", "&&", "node", "dist/index.js"]