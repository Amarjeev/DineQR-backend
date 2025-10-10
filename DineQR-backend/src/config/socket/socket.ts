import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import registerSocketEvents from "./eventHandlers";

/**
 * Initializes the Socket.IO server and attaches all event handlers.
 * @param httpServer - Express HTTP server instance
 */
export const initSocket = (httpServer: HttpServer) => {
  // ✅ Create Socket.IO instance with proper CORS setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://dine-qr-website.vercel.app",
      ],
      credentials: true,
    },
  });

  // ✅ Handle client connection
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);

    // Register all event handlers for this socket
    registerSocketEvents(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
