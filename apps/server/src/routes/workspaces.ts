import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { listWorkspaces, createWorkspace, getWorkspace, createBoard } from "../controllers/workspaces.controller";

export const workspacesRouter = Router();
workspacesRouter.use(requireAuth);

workspacesRouter.get("/", listWorkspaces);
workspacesRouter.post("/", createWorkspace);
workspacesRouter.get("/:id", getWorkspace);
workspacesRouter.post("/:id/boards", createBoard);
