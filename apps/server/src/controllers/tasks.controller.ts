import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/requireAuth";
import { emitToBoard } from "../lib/socket";
import * as svc from "../services/tasks.service";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  columnId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().nullable().optional(),
});

const moveSchema = z.object({
  columnId: z.string().uuid(),
  position: z.number().int().min(0),
});

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSchema.parse(req.body);
    const { task, boardId } = await svc.createTask((req as AuthRequest).userId, input);
    emitToBoard(boardId, "TASK_CREATED", task);
    res.status(201).json({ data: task });
  } catch (err) { next(err); }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateSchema.parse(req.body);
    const { task, boardId } = await svc.updateTask(req.params.id, (req as AuthRequest).userId, input);
    emitToBoard(boardId, "TASK_UPDATED", task);
    res.json({ data: task });
  } catch (err) { next(err); }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId, columnId, boardId } = await svc.deleteTask(req.params.id, (req as AuthRequest).userId);
    emitToBoard(boardId, "TASK_DELETED", { taskId, columnId });
    res.json({ data: null });
  } catch (err) { next(err); }
}

export async function moveTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { columnId, position } = moveSchema.parse(req.body);
    const { task, boardId } = await svc.moveTask(req.params.id, (req as AuthRequest).userId, columnId, position);
    emitToBoard(boardId, "TASK_MOVED", { taskId: task.id, columnId, position });
    res.json({ data: task });
  } catch (err) { next(err); }
}
