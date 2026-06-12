import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createTask, updateTask, deleteTask, moveTask } from "../controllers/tasks.controller";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

tasksRouter.post("/", createTask);
tasksRouter.patch("/:id", updateTask);
tasksRouter.delete("/:id", deleteTask);
tasksRouter.patch("/:id/move", moveTask);
