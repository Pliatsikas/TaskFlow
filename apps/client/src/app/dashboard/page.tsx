"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus, Loader2, X, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { useWorkspaces, useCreateWorkspace, useCreateBoard, useDeleteBoard } from "@/hooks/useWorkspaces";
import { useAuthStore } from "@/store/auth.store";
import { Workspace, Board } from "@taskflow/shared";

type WorkspaceWithBoards = Workspace & { boards: Board[] };

function BoardCard({ board, workspaceId }: { board: Board; workspaceId: string }) {
  const deleteBoard = useDeleteBoard(workspaceId);

  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl p-4
                    hover:border-brand-300 hover:shadow-sm transition-all">
      <Link href={`/board/${board.id}`} className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
          <LayoutGrid size={15} className="text-brand-600" />
        </div>
        <p className="font-medium text-gray-900 text-sm">{board.title}</p>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          if (confirm(`Delete "${board.title}"?`)) {
            deleteBoard.mutate(board.id);
          }
        }}
        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100
                   hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function CreateBoardModal({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const create = useCreateBoard(workspaceId);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate(title.trim(), { onSuccess: onClose });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">New board</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Sprint 2, Product Roadmap"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={!title.trim() || create.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700
                         disabled:opacity-50 rounded-lg">
              {create.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWs = useCreateWorkspace();
  const [newBoardFor, setNewBoardFor] = useState<string | null>(null);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Good morning, {user?.name?.split(" ")[0]} 👋
                </h1>
                <p className="text-gray-500 mt-1 text-sm">Your workspaces and boards</p>
              </div>
              <button onClick={() => createWs.mutate("My Workspace")}
                disabled={createWs.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                           text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                <Plus size={15} /> New workspace
              </button>
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-brand-500" />
              </div>
            )}

            {/* Workspace sections */}
            {(workspaces as WorkspaceWithBoards[])?.map((ws) => (
              <div key={ws.id} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-gray-700">{ws.name}</h2>
                  <button onClick={() => setNewBoardFor(ws.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors">
                    <Plus size={12} /> Add board
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {/* Board cards */}
                  {ws.boards?.map((board) => (
                    <BoardCard key={board.id} board={board} workspaceId={ws.id} />
                  ))}
                  {/* New board button */}
                  <button onClick={() => setNewBoardFor(ws.id)}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4
                               hover:border-brand-300 hover:bg-brand-50 transition-colors
                               flex items-center justify-center gap-2 text-gray-400 hover:text-brand-500">
                    <Plus size={16} />
                    <span className="text-sm font-medium">New board</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {!isLoading && workspaces?.length === 0 && (
              <div className="text-center py-16">
                <LayoutGrid size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No workspaces yet</p>
                <p className="text-gray-400 text-sm mt-1">Create a workspace to get started</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {newBoardFor && (
        <CreateBoardModal workspaceId={newBoardFor} onClose={() => setNewBoardFor(null)} />
      )}
    </AuthGuard>
  );
}
