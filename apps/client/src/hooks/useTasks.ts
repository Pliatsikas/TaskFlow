import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useBoardStore } from "@/store/board.store";
import { boardKeys } from "./useBoard";
import type { Task, ApiResponse } from "@taskflow/shared";

interface CreateTaskInput {
  title: string;
  columnId: string;
  description?: string;
  assigneeId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
}

interface MoveTaskInput {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newPosition: number;
}

export function useCreateTask(boardId: string) {
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data } = await api.post<ApiResponse<Task>>("/tasks", input);
      return data.data;
    },
  });
}

export function useMoveTask(boardId: string) {
  const moveTask = useBoardStore((s) => s.moveTask);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, toColumnId, newPosition }: MoveTaskInput) => {
      const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/move`, {
        columnId: toColumnId,
        position: newPosition,
      });
      return data.data;
    },
    onMutate: ({ taskId, fromColumnId, toColumnId, newPosition }) => {
      // Optimistic update — move the task in the store immediately
      moveTask(taskId, fromColumnId, toColumnId, newPosition);
    },
    onError: () => {
      // On error: refetch to get correct server state
      qc.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
}

export function useDeleteTask(boardId: string) {
  const deleteTask = useBoardStore((s) => s.deleteTask);

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string; columnId: string }) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: (_, { taskId, columnId }) => {
      deleteTask(taskId, columnId);
    },
  });
}
