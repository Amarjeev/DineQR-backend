import { Server, Socket } from "socket.io";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import NotificationSchemaModel from "../../models/notification/notification_SchemaModel";

/**
 * Registers all socket event handlers for a single connected client.
 * @param io - Socket.IO server instance
 * @param socket - The connected client socket
 */
export default function registerSocketEvents(_io: Server, socket: Socket) {
  // ==============================================
  // 🧩 JOIN HOTEL ORDERS CHANNEL
  // ==============================================
  
  // Handle joining hotel orders channel and fetch pending orders
  socket.on("joinHotelOrdersChannel", async (hotelKey: string) => {
    // Join socket room for specific hotel
    socket.join(hotelKey);
    console.log(`✅ Joined hotel room: ${hotelKey}`);

    try {
      // Fetch pending orders that meet specific criteria:
      // - Not accepted, cancelled, or delivered
      // - Not deleted from system
      const orderData = await OrderSchemaModel.find({
        hotelKey,
        orderAccepted: false,
        orderCancelled: false,
        kitchOrderCancelation: false,
        orderDelivered: false,
        isDeleted: false,
      }).lean();

      // Send initial orders data to connected client
      socket.emit("initialOrders", orderData);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  });

  // ==============================================
  // 🧩 JOIN HOTEL CONFIRMED ORDERS CHANNEL
  // ==============================================
  
  // Handle joining confirmed orders channel and fetch accepted orders
  socket.on("joinHotelConfirmedOrdersChannel", async (hotelKey: string) => {
    // Join socket room for specific hotel
    socket.join(hotelKey);
    console.log(`✅ Joined hotel room: ${hotelKey}`);

    try {
      // Fetch confirmed orders that meet specific criteria:
      // - Accepted but not cancelled or delivered
      // - Not deleted from system
      const orderData = await OrderSchemaModel.find({
        hotelKey,
        orderAccepted: true,
        orderCancelled: false,
        kitchOrderCancelation: false,
        orderDelivered: false,
        isDeleted: false,
      }).lean();

      // Send confirmed orders data to connected client
      socket.emit("confirmOrders", orderData);
    } catch (err) {
      console.error("❌ Error fetching confirmOrders:", err);
    }
  });

  // ==============================================
  // 🧩 JOIN HOTEL NOTIFICATION CHANNEL
  // ==============================================
  
  // Handle joining notification channel and fetch user-specific notifications
  socket.on(
    "joinHotelNotificationChannel",
    async ({ hotelKey, staffUserId }) => {
      // Validate required parameters
      if (!hotelKey || !staffUserId) {
        console.warn(
          "❌ Missing parameters while joining notification channel"
        );
        return;
      }

      try {
        // Join socket room for specific hotel
        socket.join(hotelKey);
        console.log(`✅ Joined hotel room: ${hotelKey}`);

        // ==============================================
        // 🧩 FETCH UNREAD NOTIFICATIONS
        // ==============================================
        
        // Fetch notifications that:
        // - User exists in existUsers array
        // - User has not read the message (not in messageReaders)
        // - User has not deleted the message (not in messageDelete)
        const messageData = await NotificationSchemaModel.find({
          hotelKey,
          existUsers: staffUserId, // Staff must be in existUsers
          messageReaders: { $ne: staffUserId }, // Not read by staff
          messageDelete: { $ne: staffUserId }, // Not deleted by staff
        })
          .sort({ createdAt: -1 }) // Newest first
          .lean()
          .select("messageType messageContent");

        // Send initial unread notifications to this staff member
        socket.emit("initialNotifications", messageData);

        // ==============================================
        // 🧩 FETCH READ NOTIFICATIONS
        // ==============================================
        
        // Fetch notifications that:
        // - User exists in existUsers array
        // - User has read the message (in messageReaders)
        // - User has not deleted the message (not in messageDelete)
        const markReadMessages = await NotificationSchemaModel.find({
          hotelKey,
          existUsers: staffUserId,
          messageReaders: staffUserId,
          messageDelete: { $ne: staffUserId },
        })
          .sort({ createdAt: -1 })
          .lean()
          .select("messageType messageContent");

        // Send read notifications to this staff member
        socket.emit("markReadNotifications", markReadMessages);
      } catch (error) {
        // ==============================================
        // 🧩 ERROR HANDLING
        // ==============================================
        
        console.error("❌ Error fetching notifications:", error);
        // Send error message to client
        socket.emit("notificationError", {
          message: "Failed to fetch notifications. Please try again.",
        });
      }
    }
  );
}