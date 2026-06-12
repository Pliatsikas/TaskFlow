"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@taskflow/shared";
import { useDeleteTask } from "@/hooks/useTasks";
import { useState } from "react";
import { EditTaskModal } from "./EditTaskModal";

const PRIORITY_STYLES = {
  LOW:    "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH:   "bg-red-100 text-red-700",
  URGENT: "bg-purple-100 text-purple-700",
} as const;

interface TaskCardProps {
  task: Task;
  boardId: string;
  isDragOverlay?: boolean;
}

export function TaskCard({ task,boardId, isDragOverlay = false }: TaskCardProps) {
  const deleteTask = useDeleteTask(boardId);
  const [showEdit, setShowEdit] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setShowEdit(true)}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing group",
        "hover:border-brand-300 hover:shadow-sm transition-all select-none",
        isDragging && "opacity-40 border-brand-400",
        isDragOverlay && "shadow-lg rotate-1 opacity-100 cursor-grabbing"
      )}
    >
      {/* Priority badge */}
      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", PRIORITY_STYLES[task.priority])}>
        {task.priority}
      </span>

      {/* Title */}
      <p className="text-sm text-gray-900 font-medium mt-2 leading-snug">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      {/* Footer: due date + assignee */}
      <div className="flex items-center justify-between mt-3">
  <div className="flex items-center gap-2">
    {task.dueDate && (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Calendar size={11} />
        {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </span>
    )}
  </div>
  <div className="flex items-center gap-1.5">
    <button
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setShowEdit(true);
        e.stopPropagation();
        if (confirm(`Delete "${task.title}"?`)) {
          deleteTask.mutate({ taskId: task.id, columnId: task.columnId });
        }
      }}
      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50
                 text-gray-300 hover:text-red-500 transition-all"
    >
      <Trash2 size={12} />
    </button>
    {task.assignee ? (
      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center
                     text-xs font-medium text-brand-700" title={task.assignee.name}>
        {task.assignee.name.charAt(0).toUpperCase()}
      </div>
    ) : (
      <User size={14} className="text-gray-300" />
    )}
  </div>
</div>
{showEdit && (
        <EditTaskModal
          task={task}
          boardId={boardId}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
    
  );
}
