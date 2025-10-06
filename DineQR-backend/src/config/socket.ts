import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

const HOTEL_KEY = "68c016f89540bdb6226598f2";

export const initSocket = (httpServer: HttpServer) => {
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

  io.on("connection", (socket: Socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Automatically join the hotel room
    socket.join(HOTEL_KEY);
    console.log(`Client ${socket.id} joined hotel room ${HOTEL_KEY}`);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
};
