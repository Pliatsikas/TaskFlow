import { useEffect } from "react";
import { getSocket, joinBoard, leaveBoard } from "@/lib/socket";
import { useBoardStore } from "@/store/board.store";
import type { Task } from "@taskflow/shared";

export function useBoardSocket(boardId: string) {
  const { addTask, updateTask, deleteTask, moveTask } = useBoardStore();

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();
    joinBoard(boardId);

    // Someone else created a task
    socket.on("TASK_CREATED", (task: Task) => {
      addTask(task);
    });

    // Someone else updated a task
    socket.on("TASK_UPDATED", (task: Task) => {
      updateTask(task);
    });

    // Someone else deleted a task
    socket.on("TASK_DELETED", ({ taskId, columnId }: { taskId: string; columnId: string }) => {
      deleteTask(taskId, columnId);
    });

    // Someone else moved a task
    socket.on(
      "TASK_MOVED",
      ({ taskId, columnId, position }: { taskId: string; columnId: string; position: number }) => {
        // Find current column of this task in the store
        const state = useBoardStore.getState();
        const fromColumn = Object.entries(state.tasksByColumn).find(([, tasks]) =>
          tasks.some((t) => t.id === taskId)
        );
        if (fromColumn) {
          moveTask(taskId, fromColumn[0], columnId, position);
        }
      }
    );

    return () => {
      leaveBoard(boardId);
      socket.off("TASK_CREATED");
      socket.off("TASK_UPDATED");
      socket.off("TASK_DELETED");
      socket.off("TASK_MOVED");
    };
  }, [boardId, addTask, updateTask, deleteTask, moveTask]);
}
