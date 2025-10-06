import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import OrderSchemaModel from "../models/orders/order_SchemaModel";

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
    console.log(`🟢 Client connected: ${socket.id}`);

    // Listen for joinRoom event
    socket.on("joinRoom", async (hotelKey: string) => {
      // 1️⃣ Save hotelKey and join room
      socket.join(hotelKey);
      console.log(`Client ${socket.id} joined hotel room ${hotelKey}`);

      // 2️⃣ Fetch orders for this hotel
      try {
        const orderData = await OrderSchemaModel.find({
          hotelKey,
          orderAccepted: false,
          orderCancelled: false,
        }).lean();

        // 3️⃣ Send initial orders to this client only
        socket.emit("initialOrders", orderData);
        console.log(`Sent ${orderData.length} orders to client ${socket.id}`);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
