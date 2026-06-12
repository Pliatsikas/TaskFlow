import "dotenv/config";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";
import { initSocket } from "./lib/socket";

const PORT = process.env.PORT ?? 4000;

async function main() {
  await prisma.$connect();
  console.log("✅ PostgreSQL connected");

  await redis.ping();
  console.log("✅ Redis connected");

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      credentials: true,
    },
  });
  initSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
