import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/requireAuth";

const REFRESH_COOKIE = "refresh_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ─── Validation schemas ───────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(60),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ─── Handlers ─────────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token in Redis so we can revoke it on logout
    await redis.setEx(`refresh:${user.id}`, 60 * 60 * 24 * 7, refreshToken);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, passwordHash: true },
    });

    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const { passwordHash: _, ...safeUser } = user;

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await redis.setEx(`refresh:${user.id}`, 60 * 60 * 24 * 7, refreshToken);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({ data: { user: safeUser, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new AppError(401, "No refresh token");

    const { userId } = verifyRefreshToken(token);

    // Check the token matches what we stored (allows single-device revocation)
    const stored = await redis.get(`refresh:${userId}`);
    if (stored !== token) throw new AppError(401, "Refresh token revoked");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new AppError(401, "User not found");

    const newAccessToken = signAccessToken(userId);
    const newRefreshToken = signRefreshToken(userId);

    await redis.setEx(`refresh:${userId}`, 60 * 60 * 24 * 7, newRefreshToken);
    res.cookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTIONS);

    res.json({ data: { user, accessToken: newAccessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthRequest).userId;
    await redis.del(`refresh:${userId}`);
    res.clearCookie(REFRESH_COOKIE);
    res.json({ data: null, message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthRequest).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new AppError(404, "User not found");
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}
