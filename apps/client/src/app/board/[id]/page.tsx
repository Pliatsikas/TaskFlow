"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { useBoard } from "@/hooks/useBoard";
import { useBoardSocket } from "@/hooks/useSocket";
import { useEffect } from "react";
import { useBoardStore } from "@/store/board.store";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: board, isLoading, isError } = useBoard(id);
  const reset = useBoardStore((s) => s.reset);

  // Connect to Socket.io room for this board
  useBoardSocket(id);

  // Clean up store when leaving the page
  useEffect(() => () => { reset(); }, [reset]);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Board header */}
          <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <Link href="/dashboard"
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-semibold text-gray-900">
              {isLoading ? "Loading…" : board?.title ?? "Board"}
            </h1>
            {board && (
              <span className="text-sm text-gray-400">{board.workspace?.members?.length ?? 0} members</span>
            )}
          </header>

          {/* Board content */}
          <main className="flex-1 overflow-x-auto overflow-y-auto p-6">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-brand-500" />
              </div>
            )}

            {isError && (
              <div className="flex items-center justify-center h-full text-gray-400">
                Board not found or you don&apos;t have access.
              </div>
            )}

            {board && (
              <KanbanBoard
                boardId={id}
                members={board.workspace?.members ?? []}
              />
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
