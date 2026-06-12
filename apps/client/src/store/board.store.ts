import { create } from "zustand";
import { Board, Column, Task } from "@taskflow/shared";

interface BoardState {
  board: Board | null;
  columns: Column[];
  // Tasks indexed by columnId for O(1) lookup
  tasksByColumn: Record<string, Task[]>;

  setBoard: (board: Board, columns: Column[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => void;
  addColumn: (column: Column) => void;
  reset: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  columns: [],
  tasksByColumn: {},

  setBoard: (board, columns) => {
    const tasksByColumn: Record<string, Task[]> = {};
    columns.forEach((col) => {
      tasksByColumn[col.id] = col.tasks ?? [];
    });
    set({ board, columns, tasksByColumn });
  },

  addTask: (task) =>
    set((state) => ({
      tasksByColumn: {
        ...state.tasksByColumn,
        [task.columnId]: [...(state.tasksByColumn[task.columnId] ?? []), task].sort(
          (a, b) => a.position - b.position
        ),
      },
    })),

  updateTask: (task) =>
    set((state) => ({
      tasksByColumn: {
        ...state.tasksByColumn,
        [task.columnId]: state.tasksByColumn[task.columnId]?.map((t) =>
          t.id === task.id ? task : t
        ) ?? [],
      },
    })),

  deleteTask: (taskId, columnId) =>
    set((state) => ({
      tasksByColumn: {
        ...state.tasksByColumn,
        [columnId]: state.tasksByColumn[columnId]?.filter((t) => t.id !== taskId) ?? [],
      },
    })),

  moveTask: (taskId, fromColumnId, toColumnId, newPosition) =>
    set((state) => {
      const fromTasks = [...(state.tasksByColumn[fromColumnId] ?? [])];
      const taskIndex = fromTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return state;

      const [task] = fromTasks.splice(taskIndex, 1);
      const movedTask = { ...task, columnId: toColumnId, position: newPosition };

      const toTasks = fromColumnId === toColumnId
        ? fromTasks
        : [...(state.tasksByColumn[toColumnId] ?? [])];

      toTasks.splice(newPosition, 0, movedTask);

      return {
        tasksByColumn: {
          ...state.tasksByColumn,
          [fromColumnId]: fromTasks,
          [toColumnId]: toTasks,
        },
      };
    }),

  addColumn: (column) =>
    set((state) => ({
      columns: [...state.columns, column],
      tasksByColumn: { ...state.tasksByColumn, [column.id]: [] },
    })),

  reset: () => set({ board: null, columns: [], tasksByColumn: {} }),
}));
