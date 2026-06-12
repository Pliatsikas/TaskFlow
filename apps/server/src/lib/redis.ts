import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

// Connect once on import
redis.connect().catch(console.error);
