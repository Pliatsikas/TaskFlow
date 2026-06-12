"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { useBoardStore } from "@/store/board.store";
import { useMoveTask } from "@/hooks/useTasks";
import type { Task } from "@taskflow/shared";

interface Member {
  user: { id: string; name: string; email: string };
}

interface KanbanBoardProps {
  boardId: string;
  members: Member[];
}

export function KanbanBoard({ boardId, members }: KanbanBoardProps) {
  const { columns, tasksByColumn, moveTask: moveInStore } = useBoardStore();
  const moveTaskMutation = useMoveTask(boardId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function findColumnForTask(taskId: string): string | null {
    for (const [colId, tasks] of Object.entries(tasksByColumn)) {
      if (tasks.some((t) => t.id === taskId)) return colId;
    }
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    const colId = findColumnForTask(active.id as string);
    if (!colId) return;
    const task = tasksByColumn[colId]?.find((t) => t.id === active.id) ?? null;
    setActiveTask(task);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const fromColId = findColumnForTask(activeId);
    if (!fromColId) return;

    // Determine target column
    let toColId: string;
    if (overId.startsWith("col-")) {
      toColId = overId.replace("col-", "");
    } else {
      const col = findColumnForTask(overId);
      if (!col) return;
      toColId = col;
    }

    if (fromColId === toColId) return;

    // Live preview while dragging: move in store immediately
    const toTasks = tasksByColumn[toColId] ?? [];
    const overIndex = toTasks.findIndex((t) => t.id === overId);
    const newPos = overIndex >= 0 ? overIndex : toTasks.length;
    moveInStore(activeId, fromColId, toColId, newPos);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const fromColId = findColumnForTask(activeId);
    if (!fromColId) return;

    let toColId: string;
    if (overId.startsWith("col-")) {
      toColId = overId.replace("col-", "");
    } else {
      toColId = findColumnForTask(overId) ?? fromColId;
    }

    const toTasks = tasksByColumn[toColId] ?? [];
    const newPos = toTasks.findIndex((t) => t.id === activeId);
    const finalPos = newPos >= 0 ? newPos : toTasks.length;

    // Persist to server
    moveTaskMutation.mutate({
      taskId: activeId,
      fromColumnId: fromColId,
      toColumnId: toColId,
      newPosition: finalPos,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 items-start pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] ?? []}
            boardId={boardId}
            members={members}
          />
        ))}
      </div>

      {/* Ghost card shown while dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeTask && <TaskCard task={activeTask} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
