import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Workspace, Board, ApiResponse } from "@taskflow/shared";

export const wsKeys = {
  all: ["workspaces"] as const,
  detail: (id: string) => ["workspaces", id] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: wsKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Workspace[]>>("/workspaces");
      return data.data;
    },
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: wsKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Workspace & { boards: Board[] }>>(`/workspaces/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<ApiResponse<Workspace>>("/workspaces", { name });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: wsKeys.all }),
  });
}

export function useCreateBoard(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post<ApiResponse<Board & { columns: unknown[] }>>(
        `/workspaces/${workspaceId}/boards`,
        { title }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wsKeys.all });
      qc.invalidateQueries({ queryKey: wsKeys.detail(workspaceId) });
    },
  });
}

export function useDeleteBoard(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (boardId: string) => {
      await api.delete(`/boards/${boardId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wsKeys.all });
      qc.invalidateQueries({ queryKey: wsKeys.detail(workspaceId) });
    },
  });
}