import { Server, Socket } from "socket.io";
import NotificationSchemaModel from "../../../models/notification/notification_SchemaModel";

/**
 * Hotel Notification Room - Handles socket events for hotel notification management
 * Manages real-time notifications for hotel staff including unread and read messages
 * 
 * @param _io - Socket.IO Server instance (unused in this module but kept for consistency)
 * @param socket - Individual socket connection for event handling
 */
export default function hotelNotificationRoom(_io: Server, socket: Socket) {
  /**
   * Event: joinHotelNotificationChannel
   * Handles hotel staff joining their specific hotel notification channel
   * Fetches and sends both unread and read notifications for the staff user
   * 
   * @param hotelKey - Unique identifier for the hotel
   * @param staffUserId - Unique identifier for the staff user
   */
  socket.on("joinHotelNotificationChannel", async ({ hotelKey, staffUserId }) => {
    // Validate required parameters
    if (!hotelKey || !staffUserId) return console.warn("❌ Missing parameters");

    // Join the hotel-specific room for real-time notification updates
    socket.join(hotelKey);

    try {
      // Fetch unread notifications for the staff user
      const messageData = await NotificationSchemaModel.find({
        hotelKey, // Filter by hotel identifier
        existUsers: staffUserId, // Notifications that include this user
        messageReaders: { $ne: staffUserId }, // Exclude already read messages
        messageDelete: { $ne: staffUserId }, // Exclude deleted messages
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean() // Use lean for better performance
      .select("messageType messageContent"); // Select only necessary fields

      // Send initial unread notifications to the connected client
      socket.emit("initialNotifications", messageData);

      // Fetch read notifications for the staff user
      const markReadMessages = await NotificationSchemaModel.find({
        hotelKey, // Filter by hotel identifier
        existUsers: staffUserId, // Notifications that include this user
        messageReaders: staffUserId, // Only include read messages
        messageDelete: { $ne: staffUserId }, // Exclude deleted messages
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean() // Use lean for better performance
      .select("messageType messageContent"); // Select only necessary fields

      // Send read notifications to the connected client
      socket.emit("markReadNotifications", markReadMessages);

    } catch (error) {
      // Handle database or fetch errors
      console.error("❌ Error fetching notifications:", error);
      
      // Send error notification to the client
      socket.emit("notificationError", { 
        message: "Failed to fetch notifications." 
      });
    }
  });
}