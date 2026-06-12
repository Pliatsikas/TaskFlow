import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false, // connect manually after login
      auth: (cb) => {
        // Always send the latest token (handles refresh)
        cb({ token: useAuthStore.getState().accessToken });
      },
    });

    socket.on("connect", () => console.log("🔌 Socket connected"));
    socket.on("disconnect", () => console.log("🔌 Socket disconnected"));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));
  }
  return socket;
}

export function connectSocket() {
  getSocket().connect();
}

export function disconnectSocket() {
  socket?.disconnect();
}

export function joinBoard(boardId: string) {
  getSocket().emit("board:join", boardId);
}

export function leaveBoard(boardId: string) {
  getSocket().emit("board:leave", boardId);
}
