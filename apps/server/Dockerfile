FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY prisma ./prisma

RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npx prisma generate

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]