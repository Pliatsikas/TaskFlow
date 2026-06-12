import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "./jwt";

// Module-level io instance — accessible from controllers
let _io: Server | null = null;

export function initSocket(io: Server) {
  _io = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error("No token"));
    try {
      const payload = verifyAccessToken(token);
      (socket as Socket & { userId: string }).userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket as Socket & { userId: string };
    console.log(`Socket connected: ${socket.id} (user: ${userId})`);

    socket.on("board:join", (boardId: string) => {
      socket.join(`board:${boardId}`);
    });

    socket.on("board:leave", (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

// Called by controllers to broadcast to everyone in a board room
export function emitToBoard(boardId: string, event: string, payload: unknown) {
  _io?.to(`board:${boardId}`).emit(event, payload);
}
