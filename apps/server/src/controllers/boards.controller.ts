import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/requireAuth";
import { emitToBoard } from "../lib/socket";
import * as svc from "../services/boards.service";

const columnSchema = z.object({ title: z.string().min(1).max(60) });

export async function getBoard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getBoardWithColumns(req.params.id, (req as AuthRequest).userId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createColumn(req: Request, res: Response, next: NextFunction) {
  try {
    const { title } = columnSchema.parse(req.body);
    const column = await svc.createColumn(req.params.id, (req as AuthRequest).userId, title);
    emitToBoard(req.params.id, "COLUMN_CREATED", column);
    res.status(201).json({ data: column });
  } catch (err) { next(err); }
}

export async function updateColumn(req: Request, res: Response, next: NextFunction) {
  try {
    const { title } = columnSchema.parse(req.body);
    const column = await svc.updateColumn(req.params.columnId, (req as AuthRequest).userId, title);
    emitToBoard(req.params.id, "COLUMN_UPDATED", column);
    res.json({ data: column });
  } catch (err) { next(err); }
}

export async function deleteColumn(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteColumn(req.params.columnId, (req as AuthRequest).userId);
    emitToBoard(req.params.id, "COLUMN_DELETED", { columnId: req.params.columnId });
    res.json({ data: null });
  } catch (err) { next(err); }
}

export async function deleteBoard(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteBoard(req.params.id, (req as AuthRequest).userId);
    res.json({ data: null });
  } catch (err) { next(err); }
}