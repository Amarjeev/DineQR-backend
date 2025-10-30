import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import registerSocketEvents from "./registerSocketEvents";

/**
 * Initializes the Socket.IO server and attaches all event handlers.
 * @param httpServer - Express HTTP server instance
 */
export const initSocket = (httpServer: HttpServer) => {
  // ✅ Create Socket.IO instance with proper CORS setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "https://dineqr.cfd", // ✅ custom domain
        "https://www.dineqr.cfd", // ✅ www version (important)
        "https://api.dineqr.cfd", // ✅ backend subdomain
        "https://dineqr-frontend.netlify.app", // ✅ Netlify preview/live frontend
      ],
      credentials: true,
    },
  });

  // ✅ Handle client connection
  io.on("connection", (socket: Socket) => {
    // Register all event handlers for this socket
    registerSocketEvents(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {});
  });

  return io;
};
