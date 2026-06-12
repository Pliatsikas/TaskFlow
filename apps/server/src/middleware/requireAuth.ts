import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";

// Extend Express Request to carry userId after auth
export interface AuthRequest extends Request {
  userId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const { userId } = verifyAccessToken(token);
    (req as AuthRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Token expired or invalid" });
  }
}
