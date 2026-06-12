import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth";
import { workspacesRouter } from "./routes/workspaces";
import { boardsRouter } from "./routes/boards";
import { tasksRouter } from "./routes/tasks";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  // ─── Security middleware ───────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      credentials: true, // needed for cookies (refresh token)
    })
  );

  // ─── Rate limiting ─────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);

  // ─── Parsers ───────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(cookieParser());

  // ─── Health check ──────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Routes ────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRouter);
  app.use("/api/workspaces", workspacesRouter);
  app.use("/api/boards", boardsRouter);
  app.use("/api/tasks", tasksRouter);

  // ─── Error handler (must be last) ─────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
