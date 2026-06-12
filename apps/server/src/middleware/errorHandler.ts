import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err.name === "AppError") {
    const appErr = err as AppError;
    res.status(appErr.statusCode).json({ error: appErr.message });
    return;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    res.status(400).json({ error: "Validation failed", details: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
