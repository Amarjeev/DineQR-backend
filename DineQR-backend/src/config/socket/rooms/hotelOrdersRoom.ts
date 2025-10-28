import { Server, Socket } from "socket.io";
import OrderSchemaModel from "../../../models/orders/order_SchemaModel";

/**
 * Hotel Orders Room - Handles socket events for hotel order management
 * Manages real-time order updates and room joining for hotel staff
 * 
 * @param _io - Socket.IO Server instance (unused in this module but kept for consistency)
 * @param socket - Individual socket connection for event handling
 */
export default function hotelOrdersRoom(_io: Server, socket: Socket) {
  /**
   * Event: joinHotelOrdersChannel
   * Handles hotel staff joining their specific hotel orders channel
   * Fetches and sends initial pending orders for the hotel
   * 
   * @param hotelKey - Unique identifier for the hotel
   */
  socket.on("joinHotelOrdersChannel", async (hotelKey: string) => {
    // Join the hotel-specific room for real-time updates
    socket.join(hotelKey);

    try {
      // Fetch initial pending orders from database
      const orderData = await OrderSchemaModel.find({
        hotelKey, // Filter by hotel identifier
        orderAccepted: false, // Only unaccepted orders
        orderCancelled: false, // Exclude cancelled orders
        kitchOrderCancelation: false, // Exclude kitchen-cancelled orders
        orderDelivered: false, // Exclude delivered orders
        isDeleted: false, // Exclude soft-deleted orders
      }).lean(); // Use lean for better performance

      // Send initial orders data to the connected client
      socket.emit("initialOrders", orderData);
    } catch (err) {
      // Handle database or fetch errors
      console.error("❌ Error fetching orders:", err);
    }
  });
}