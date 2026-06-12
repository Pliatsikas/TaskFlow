import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    include: {
    _count: { select: { boards: true, members: true } },
    boards: { orderBy: { position: "asc" } },
    },  
    orderBy: { createdAt: "asc" },
  });
}

export async function createWorkspace(userId: string, name: string) {
  return prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      members: { create: { userId, role: "OWNER" } },
    },
  });
}

export async function getWorkspace(workspaceId: string, userId: string) {
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, members: { some: { userId } } },
    include: {
      boards: { orderBy: { position: "asc" } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!ws) throw new AppError(404, "Workspace not found");
  return ws;
}

export async function createBoard(workspaceId: string, userId: string, title: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new AppError(403, "Not a member of this workspace");

  const count = await prisma.board.count({ where: { workspaceId } });

  // Auto-create 3 default columns
  return prisma.board.create({
    data: {
      title,
      workspaceId,
      position: count,
      columns: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 },
        ],
      },
    },
    include: { columns: true },
  });
}
