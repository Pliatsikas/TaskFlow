import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getBoard, createColumn, updateColumn, deleteColumn, deleteBoard } from "../controllers/boards.controller";

export const boardsRouter = Router();
boardsRouter.use(requireAuth);

boardsRouter.get("/:id", getBoard);
boardsRouter.post("/:id/columns", createColumn);
boardsRouter.patch("/:id/columns/:columnId", updateColumn);
boardsRouter.delete("/:id/columns/:columnId", deleteColumn);
boardsRouter.delete("/:id", deleteBoard);