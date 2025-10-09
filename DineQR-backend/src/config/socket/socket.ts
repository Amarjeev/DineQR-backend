// import { Server as SocketIOServer, Socket } from "socket.io";
// import { Server as HttpServer } from "http";
// import OrderSchemaModel from "../models/orders/order_SchemaModel";

// /**
//  * Initializes a Socket.IO server for real-time order updates
//  * @param httpServer - HTTP server instance to attach Socket.IO
//  * @returns Socket.IO server instance
//  */
// export const initSocket = (httpServer: HttpServer) => {
//   // ✅ Create Socket.IO server and configure CORS
//   const io = new SocketIOServer(httpServer, {
//     cors: {
//       origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//         "https://dine-qr-website.vercel.app",
//       ],
//       credentials: true,
//     },
//   });

//   // 🔹 Handle client connections
//   io.on("connection", (socket: Socket) => {
//     console.log(`🟢 Client connected: ${socket.id}`);

//     // ================================
//     // 🔹 Join hotel-specific room
//     // ================================
//     socket.on("joinRoom", async (hotelKey: string) => {
//       // 1️⃣ Save hotelKey and join room
//       socket.join(hotelKey);

//       // 2️⃣ Fetch orders for this hotel
//       try {
//         const orderData = await OrderSchemaModel.find({
//           hotelKey,
//           orderAccepted: false,
//           orderCancelled: false,
//           isDeleted: false,
//         }).lean();

//         // 3️⃣ Send initial orders to **this client only**
//         socket.emit("initialOrders", orderData);

//       } catch (err) {
//         console.error("❌ Error fetching orders:", err);
//       }
//     });

//     // 🔹 Handle client disconnect
//     socket.on("disconnect", () => {
//       console.log(`🔴 Client disconnected: ${socket.id}`);
//     });
//   });

//   return io;
// };




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
