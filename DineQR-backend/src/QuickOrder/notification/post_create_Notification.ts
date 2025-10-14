import ManagerProfileSchema from "../../models/manager/mgr_ProfileSchemaModel";
import StaffProfileSchema from "../../models/manager/mgr_Staff_ProfileSchemaModel";
import NotificationSchemaModel from "../../models/notification/notification_SchemaModel";
import { Server as SocketIOServer } from "socket.io";
import { redis } from "../../config/redis";

export const create_Notification = async (
  hotelKey: string,
  infoData: any,
  messageType: "orderSuccess" | "cancelOrder" | "stockAlert",
  recipientRole?: "staff" | "guest" | "manager",
  io?: SocketIOServer
) => {
  try {
    // ==============================================
    // 🧩 INPUT VALIDATION
    // ==============================================

    // Validate hotelKey parameter exists and is string
    if (!hotelKey || typeof hotelKey !== "string") {
      console.error("❌ Missing or invalid hotelKey");
      return null;
    }

    // Validate infoData parameter exists and is object
    if (!infoData || typeof infoData !== "object") {
      console.error("❌ Missing or invalid infoData");
      return null;
    }

    // ==============================================
    // 🧩 DATE AND TIME FORMATTING
    // ==============================================

    // Get current date and time for notification timestamp
    const orderDate = new Date();

    // Format date as "Jan 1, 2024"
    const formattedDate = orderDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Format time as "02:30 PM"
    const formattedTime = orderDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // ==============================================
    // 🧩 ORDER TYPE AND TABLE INFORMATION
    // ==============================================

    // Determine order type label for message
    const orderTypeLabel =
      infoData.orderType === "dining" ? "Dining" : "Parcel";

    // Add table information if it's a dining order with table number
    const tableInfo =
      infoData.orderType === "dining" && infoData.tableNumber
        ? ` for Table ${infoData.tableNumber}`
        : "";

    // ==============================================
    // 🧩 MESSAGE CONTENT GENERATION
    // ==============================================

    // Initialize message content variable
    let messageContent = "";

    // Generate message based on notification type
    if (messageType === "orderSuccess") {
      // ==============================================
      // 🧩 ORDER SUCCESS NOTIFICATION
      // ==============================================

      // ✅ Order successfully placed notification
      messageContent = `✅ ${orderTypeLabel} Order *${infoData.orderId}*${tableInfo} was successfully placed on ${formattedDate} at ${formattedTime}.`;
    } else if (messageType === "cancelOrder") {
      // ==============================================
      // 🧩 ORDER CANCELLATION NOTIFICATION
      // ==============================================

      // ❌ Order canceled notification
      const canceledBy = recipientRole || "unknown";
      const kitchenReason = infoData?.kitchOrdercancelationReason;
      const guestReason = infoData?.orderCancelationReason;

      // 🧑‍🍳 STAFF NOTIFICATION FORMAT
      if (recipientRole === "staff") {
        if (canceledBy === "staff") {
          messageContent = `❌ ${orderTypeLabel} Order *${
            infoData.orderId
          }*${tableInfo} was canceled by *Kitchen* on ${formattedDate} at ${formattedTime}.${
            kitchenReason ? ` Reason: ${kitchenReason}` : ""
          }`;
        } else if (canceledBy === "guest") {
          messageContent = `❌ ${orderTypeLabel} Order *${
            infoData.orderId
          }*${tableInfo} was canceled by *Guest* on ${formattedDate} at ${formattedTime}.${
            guestReason ? ` Reason: ${guestReason}` : ""
          }`;
        } else {
          messageContent = `❌ ${orderTypeLabel} Order *${
            infoData.orderId
          }*${tableInfo} was canceled on ${formattedDate} at ${formattedTime}.${
            guestReason ? ` Reason: ${guestReason}` : ""
          }`;
        }
      }

      // 🧍 GUEST NOTIFICATION FORMAT
      else if (recipientRole === "guest") {
        messageContent = `❌ ${orderTypeLabel} Order *${
          infoData.orderId
        }*${tableInfo} was canceled by *${canceledBy}* on ${formattedDate} at ${formattedTime}.${
          guestReason ? ` Reason: ${guestReason}` : ""
        }`;
      }

      // 🧑‍💼 MANAGER OR DEFAULT NOTIFICATION FORMAT
      else {
        messageContent = `❌ ${orderTypeLabel} Order *${
          infoData.orderId
        }*${tableInfo} was canceled by *${canceledBy}* on ${formattedDate} at ${formattedTime}.${
          kitchenReason ? ` Reason: ${kitchenReason}` : ""
        }`;
      }
    } else if (messageType === "stockAlert") {
      messageContent = `⚠️ Stock Alert: *${infoData.productName}* on ${formattedDate} at ${formattedTime} is currently *${infoData.availability}*.`;
    }

    // ==============================================
    // 🧩 REDIS CACHE MANAGEMENT
    // ==============================================

    // Try to load existing users from Redis cache first
    const redisKey = `notification_userse_Id${hotelKey}`;
    let existUsers = await redis.get(redisKey);

    // If cache miss, fetch from MongoDB
    if (!existUsers) {
      // ==============================================
      // 🧩 DATABASE FETCH FOR USER DATA
      // ==============================================

      // Fetch manager and staff data in parallel for performance
      const [managerDoc, staffDocs] = await Promise.all([
        // Find manager profile by hotelKey
        ManagerProfileSchema.findOne({ _id: hotelKey, isDeleted: false })
          .lean()
          .select("_id"),
        // Find all staff profiles for this hotel
        StaffProfileSchema.find({ hotelKey, isDeleted: false })
          .lean()
          .select("staffId -_id"),
      ]);

      // Validate manager exists
      if (!managerDoc) {
        console.warn("⚠️ Manager not found for hotelKey:", hotelKey);
        return null;
      }

      // Extract manager ID and staff IDs
      const managerId = managerDoc._id.toString();
      const staffIds = staffDocs.map((s: { staffId: string }) => s.staffId);

      // Combine all users into one list for notification recipients
      existUsers = [managerId, ...staffIds];

      // ==============================================
      // 🧩 CACHE THE USER DATA IN REDIS
      // ==============================================

      // Store user list in Redis with 1 day expiration (86400 seconds)
      await redis.set(redisKey, JSON.stringify(existUsers), { ex: 86400 });
    }

    // ==============================================
    // 🧩 NOTIFICATION DOCUMENT CREATION
    // ==============================================

    // Create new notification document in MongoDB
    const message = new NotificationSchemaModel({
      hotelKey,
      messageType,
      existUsers,
      messageContent,
    });

    // Save notification to database
    await message.save();

    // ==============================================
    // 🧩 REAL-TIME NOTIFICATION BROADCAST
    // ==============================================

    // Broadcast new notification via Socket.IO if available
    if (io) io.emit("newNotification", message);

    // Log successful notification creation
    console.log("📢 Notification created:", messageContent);
    return;
  } catch (error) {
    // ==============================================
    // 🧩 ERROR HANDLING
    // ==============================================

    // Log any errors that occur during notification creation
    console.error("❌ Error creating notification:", error);
    return null;
  }
};
