"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { CreateTaskModal } from "./CreateTaskModal";
import { cn } from "@/lib/utils";
import type { Column, Task } from "@taskflow/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { boardKeys } from "@/hooks/useBoard";

interface Member {
  user: { id: string; name: string; email: string };
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  boardId: string;
  members: Member[];
}

export function KanbanColumn({ column, tasks, boardId, members }: KanbanColumnProps) {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const qc = useQueryClient();

  const deleteColumn = useMutation({
    mutationFn: () => api.delete(`/boards/${boardId}/columns/${column.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
  });

  const renameColumn = useMutation({
    mutationFn: () => api.patch(`/boards/${boardId}/columns/${column.id}`, { title: newTitle }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      setIsRenaming(false);
      setShowMenu(false);
    },
  });

  // useDroppable makes this column a drop target for tasks from other columns
  const { setNodeRef, isOver } = useDroppable({ id: `col-${column.id}` });

  return (
    <>
      <div className="flex flex-col w-72 flex-shrink-0">
        
        {/* Column header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {isRenaming ? (
            <form onSubmit={(e) => { e.preventDefault(); renameColumn.mutate(); }}
              className="flex items-center gap-1 flex-1">
              <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 text-sm font-medium px-2 py-0.5 border border-brand-400
                   rounded focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button type="submit" className="text-xs text-brand-600 font-medium px-2">Save</button>
              <button type="button" onClick={() => setIsRenaming(false)}
                className="text-xs text-gray-400 px-1">✕</button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-700">{column.title}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                {tasks.length}
              </span>
            </div>
          )}

          <div className="relative flex items-center gap-1">
            <button onClick={() => setShowModal(true)}
              className="w-6 h-6 flex items-center justify-center text-gray-400
                 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors">
              <Plus size={14} />
            </button>
            <button onClick={() => setShowMenu(!showMenu)}
              className="w-6 h-6 flex items-center justify-center text-gray-400
                 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <MoreHorizontal size={14} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200
                        rounded-lg shadow-lg py-1 w-36">
                  <button onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm
                       text-gray-700 hover:bg-gray-50">
                    <Pencil size={13} /> Rename
                  </button>
                  <button onClick={() => {
                    if (confirm(`Delete "${column.title}"?`)) deleteColumn.mutate();
                  }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm
                       text-red-600 hover:bg-red-50">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Drop zone + task list */}
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-2 min-h-24 p-2 rounded-xl transition-colors",
            isOver ? "bg-brand-50 ring-2 ring-brand-200" : "bg-gray-100/60"
          )}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} boardId={boardId} />
            ))}
          </SortableContext>

          {/* Empty state */}
          {tasks.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-1.5 py-4 text-xs text-gray-400
                         hover:text-brand-500 hover:bg-brand-50 rounded-lg border-2 border-dashed
                         border-gray-200 hover:border-brand-200 transition-colors"
            >
              <Plus size={12} /> Add task
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <CreateTaskModal
          boardId={boardId}
          columnId={column.id}
          members={members}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
