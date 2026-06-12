import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useBoardStore } from "@/store/board.store";
import type { Board, Column, Task, ApiResponse } from "@taskflow/shared";

type BoardDetail = Board & {
  columns: (Column & { tasks: Task[] })[];
  workspace: { members: { user: { id: string; name: string; email: string; avatarUrl: string | null } }[] };
};

export const boardKeys = {
  detail: (id: string) => ["boards", id] as const,
};

export function useBoard(boardId: string) {
  const setBoard = useBoardStore((s) => s.setBoard);

  const query = useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BoardDetail>>(`/boards/${boardId}`);
      return data.data;
    },
    enabled: !!boardId,
  });

  // Sync query result into Zustand store
  useEffect(() => {
    if (query.data) {
      setBoard(query.data, query.data.columns);
    }
  }, [query.data, setBoard]);

  return query;
}

export function useCreateColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post<ApiResponse<Column>>(`/boards/${boardId}/columns`, { title });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });
}
