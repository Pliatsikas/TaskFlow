import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

const taskInclude = {
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  labels: { include: { label: true } },
};

export async function createTask(userId: string, input: CreateTaskInput) {
  const column = await prisma.column.findFirst({
    where: {
      id: input.columnId,
      board: { workspace: { members: { some: { userId } } } },
    },
    include: { board: true },
  });
  if (!column) throw new AppError(404, "Column not found");

  const count = await prisma.task.count({ where: { columnId: input.columnId } });

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      columnId: input.columnId,
      assigneeId: input.assigneeId,
      priority: (input.priority ?? "MEDIUM") as TaskPriority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      position: count,
    },
    include: taskInclude,
  });

  return { task, boardId: column.board.id };
}

export async function updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: { board: { workspace: { members: { some: { userId } } } } },
    },
    include: { column: { include: { board: true } } },
  });
  if (!existing) throw new AppError(404, "Task not found");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...input,
      priority: input.priority as TaskPriority | undefined,
      dueDate:
        input.dueDate === null ? null
        : input.dueDate ? new Date(input.dueDate)
        : undefined,
    },
    include: taskInclude,
  });

  return { task, boardId: existing.column.board.id };
}

export async function deleteTask(taskId: string, userId: string) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: { board: { workspace: { members: { some: { userId } } } } },
    },
    include: { column: { include: { board: true } } },
  });
  if (!existing) throw new AppError(404, "Task not found");

  await prisma.task.delete({ where: { id: taskId } });
  return { taskId, columnId: existing.columnId, boardId: existing.column.board.id };
}

export async function moveTask(
  taskId: string,
  userId: string,
  targetColumnId: string,
  newPosition: number
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: { board: { workspace: { members: { some: { userId } } } } },
    },
    include: { column: { include: { board: true } } },
  });
  if (!task) throw new AppError(404, "Task not found");

  const sourceColumnId = task.columnId;
  const boardId = task.column.board.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.$transaction as any)(async (tx: typeof prisma) => {
    if (sourceColumnId === targetColumnId) {
      const tasks = await tx.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { position: "asc" },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reordered = tasks.filter((t: any) => t.id !== taskId);
      reordered.splice(newPosition, 0, task);
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reordered.map((t: any, i: number) =>
          tx.task.update({ where: { id: t.id }, data: { position: i } })
        )
      );
    } else {
      const sourceTasks = await tx.task.findMany({
        where: { columnId: sourceColumnId, id: { not: taskId } },
        orderBy: { position: "asc" },
      });
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourceTasks.map((t: any, i: number) =>
          tx.task.update({ where: { id: t.id }, data: { position: i } })
        )
      );

      const targetTasks = await tx.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { position: "asc" },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const merged: any[] = [...targetTasks];
      merged.splice(newPosition, 0, { ...task, columnId: targetColumnId });
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        merged.map((t: any, i: number) =>
          tx.task.update({
            where: { id: t.id },
            data: { position: i, columnId: t.columnId },
          })
        )
      );
    }
  });

  const updated = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude,
  });
  return { task: updated!, boardId };
}
