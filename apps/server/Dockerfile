FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]