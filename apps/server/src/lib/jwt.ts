import jwt, { SignOptions } from "jsonwebtoken";

interface TokenPayload {
  userId: string;
}

export function signAccessToken(userId: string): string {
  const options: SignOptions = { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"] };
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, options);
}

export function signRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"] };
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
