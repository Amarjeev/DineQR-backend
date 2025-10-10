import { Server, Socket } from "socket.io";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";

/**
 * Registers all socket event handlers for a single connected client.
 * @param io - Socket.IO server instance
 * @param socket - The connected client socket
 */
export default function registerSocketEvents(_io: Server, socket: Socket) {
  // ==================================
  // 🔹 Join hotel room
  // ==================================
  socket.on("joinHotelOrdersChannel", async (hotelKey: string) => {
    socket.join(hotelKey);
    console.log(`✅ Joined hotel room: ${hotelKey}`);

    try {
      const orderData = await OrderSchemaModel.find({
        hotelKey,
        orderAccepted: false,
        orderCancelled: false,
        kitchOrderCancelation: false,
        orderDelivered: false,
        isDeleted: false,
      }).lean();

      socket.emit("initialOrders", orderData);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  });

  // ****************************************************************************

  socket.on("joinHotelConfirmedOrdersChannel", async (hotelKey: string) => {
    socket.join(hotelKey);
    console.log(`✅ Joined hotel room: ${hotelKey}`);

    try {
      const orderData = await OrderSchemaModel.find({
        hotelKey,
        orderAccepted: true,
        orderCancelled: false,
        kitchOrderCancelation: false,
        orderDelivered: false,
        isDeleted: false,
      }).lean();

      socket.emit("confirmOrders", orderData);
    } catch (err) {
      console.error("❌ Error fetching confirmOrders:", err);
    }
  });
}
