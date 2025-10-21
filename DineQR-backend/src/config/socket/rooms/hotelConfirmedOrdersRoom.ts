import { Server, Socket } from "socket.io";
import OrderSchemaModel from "../../../models/orders/order_SchemaModel";

/**
 * Hotel Confirmed Orders Room - Handles socket events for confirmed/accepted orders
 * Manages real-time updates for orders that have been accepted by the kitchen
 * 
 * @param _io - Socket.IO Server instance (unused in this module but kept for consistency)
 * @param socket - Individual socket connection for event handling
 */
export default function hotelConfirmedOrdersRoom(_io: Server, socket: Socket) {
  /**
   * Event: joinHotelConfirmedOrdersChannel
   * Handles hotel staff joining their specific confirmed orders channel
   * Fetches and sends initial confirmed (accepted) orders for the hotel
   * 
   * @param hotelKey - Unique identifier for the hotel
   */
  socket.on("joinHotelConfirmedOrdersChannel", async (hotelKey: string) => {
    // Join the hotel-specific room for real-time confirmed order updates
    socket.join(hotelKey);
    console.log(`✅ Joined hotel room: ${hotelKey}`);

    try {
      // Fetch confirmed orders from database that meet specific criteria
      const orderData = await OrderSchemaModel.find({
        hotelKey, // Filter by hotel identifier
        orderAccepted: true, // Only orders that have been accepted by kitchen
        orderCancelled: false, // Exclude cancelled orders
        kitchOrderCancelation: false, // Exclude kitchen-cancelled orders
        orderDelivered: false, // Exclude delivered orders (still in progress)
        isDeleted: false, // Exclude soft-deleted orders
      }).lean(); // Use lean for better performance

      // Send initial confirmed orders data to the connected client
      socket.emit("confirmOrders", orderData);
    } catch (err) {
      // Handle database or fetch errors
      console.error("❌ Error fetching confirmOrders:", err);
    }
  });
}