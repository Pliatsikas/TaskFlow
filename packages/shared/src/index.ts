// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  user: Pick<User, "id" | "name" | "email" | "avatarUrl">;
}

// ─── Board ───────────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  title: string;
  workspaceId: string;
  position: number;
}

// ─── Column ──────────────────────────────────────────────────────────────────

export interface Column {
  id: string;
  title: string;
  boardId: string;
  position: number;
  tasks?: Task[];
}

// ─── Task ────────────────────────────────────────────────────────────────────

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  assigneeId: string | null;
  assignee?: Pick<User, "id" | "name" | "avatarUrl"> | null;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  labels?: Label[];
}

// ─── Label ───────────────────────────────────────────────────────────────────

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  statusCode: number;
}

// ─── Socket events ────────────────────────────────────────────────────────────

export type SocketEvent =
  | { type: "TASK_CREATED"; payload: Task }
  | { type: "TASK_UPDATED"; payload: Task }
  | { type: "TASK_MOVED"; payload: { taskId: string; columnId: string; position: number } }
  | { type: "TASK_DELETED"; payload: { taskId: string } }
  | { type: "COLUMN_CREATED"; payload: Column }
  | { type: "COLUMN_UPDATED"; payload: Column }
  | { type: "COLUMN_DELETED"; payload: { columnId: string } }
  | { type: "MEMBER_JOINED"; payload: WorkspaceMember }
  | { type: "MEMBER_LEFT"; payload: { userId: string } };
