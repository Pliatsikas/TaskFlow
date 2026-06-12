FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Generate Prisma client
RUN cd apps/server && npx prisma generate

# Build TypeScript
RUN cd apps/server && npm run build

WORKDIR /app/apps/server

EXPOSE 4000

CMD ["node", "dist/index.js"]