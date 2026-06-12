import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/requireAuth";
import * as svc from "../services/workspaces.service";

const createWorkspaceSchema = z.object({ name: z.string().min(1).max(80) });
const createBoardSchema = z.object({ title: z.string().min(1).max(80) });

export async function listWorkspaces(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getUserWorkspaces((req as AuthRequest).userId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = createWorkspaceSchema.parse(req.body);
    const data = await svc.createWorkspace((req as AuthRequest).userId, name);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function getWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getWorkspace(req.params.id, (req as AuthRequest).userId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createBoard(req: Request, res: Response, next: NextFunction) {
  try {
    const { title } = createBoardSchema.parse(req.body);
    const data = await svc.createBoard(req.params.id, (req as AuthRequest).userId, title);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}
