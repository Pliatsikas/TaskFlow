import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// Full board with columns and tasks — used by the board view
export async function getBoardWithColumns(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: { members: { some: { userId } } },
    },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignee: { select: { id: true, name: true, avatarUrl: true } },
              labels: { include: { label: true } },
            },
          },
        },
      },
      workspace: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });
  if (!board) throw new AppError(404, "Board not found");
  return board;
}

export async function createColumn(boardId: string, userId: string, title: string) {
  // Verify board access
  const board = await prisma.board.findFirst({
    where: { id: boardId, workspace: { members: { some: { userId } } } },
  });
  if (!board) throw new AppError(404, "Board not found");

  const count = await prisma.column.count({ where: { boardId } });
  return prisma.column.create({ data: { title, boardId, position: count } });
}

export async function updateColumn(columnId: string, userId: string, title: string) {
  const col = await prisma.column.findFirst({
    where: { id: columnId, board: { workspace: { members: { some: { userId } } } } },
  });
  if (!col) throw new AppError(404, "Column not found");
  return prisma.column.update({ where: { id: columnId }, data: { title } });
}

export async function deleteColumn(columnId: string, userId: string) {
  const col = await prisma.column.findFirst({
    where: { id: columnId, board: { workspace: { members: { some: { userId } } } } },
  });
  if (!col) throw new AppError(404, "Column not found");
  await prisma.column.delete({ where: { id: columnId } });
}

export async function deleteBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: { members: { some: { userId } } },
    },
  });
  if (!board) throw new AppError(404, "Board not found");

  await prisma.board.delete({ where: { id: boardId } });
}