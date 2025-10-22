import GuestProfileSchema from "../models/guest/guest_ProfileSchemaModel";
import { Server as SocketIOServer } from "socket.io";

/**
 * Send a structured notification object to a guest.
 * - Saves notification in DB
 * - Auto-expires after 5 hours
 * - Emits real-time Socket.IO message
 */
export const guest_Notifications = async (
  io: SocketIOServer,
  order: any,
  title: string
) => {
  try {
    let message: string;

    switch (title) {
      case "✅accepted":
        message = `Your ${order?.orderType} order   ${order?.orderId} has been accepted by the kitchen.`;
        break;
      case "🚫rejected":
        message =
          `Your ${order?.orderType} order   ${order?.orderId} has been rejected by the kitchen.` +
          (order?.kitchOrdercancelationReason
            ? ` Reason: ${order?.kitchOrdercancelationReason}`
            : "");
        break;
      case "⭐completed":
        message = `Your ${order?.orderType} order   ${order?.orderId} has been delivered. Enjoy! 🎉`;
        break;
      case "❌cancelled":
        message = `Your ${order?.orderType} order   ${order?.orderId} has been cancelled.`;
        break;
      case "💳payment":
        message = `Your ${order?.orderType} order   ${order?.orderId} has been paid successfully.✅`;
        break;
      default:
        message = `Your ${order?.orderType} order   ${order?.orderId} has been updated.`;
    }

    // ✅ Create notification object
    const notification = {
      title,
      message,
      orderId: order?.orderId,
      createdAt: new Date(),
      read: false,
      hotelId: order?.hotelKey,
      expireAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // delete after 5h
    };

    // ✅ Save notification in MongoDB
    await GuestProfileSchema.findOneAndUpdate(
      { mobileNumber: order?.orderedById },
      { $push: { notifications: notification } },
      { upsert: true, new: true }
    );

    // ✅ Emit as a single object
    const roomId = `${order.hotelKey}${order.orderedById}`;
    io.to(roomId).emit("guestNewNotifications", notification);

    console.log(
      `📩 Notification sent (${title}) for order ${order?.orderId} to ${roomId}`
    );
  } catch (error) {
    console.error("❌ Error sending guest notification:", error);
  }
};
