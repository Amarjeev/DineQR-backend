import ManagerProfileSchema from "../../models/manager/mgr_ProfileSchemaModel";
import StaffProfileSchema from "../../models/manager/mgr_Staff_ProfileSchemaModel";
import NotificationSchemaModel from "../../models/notification/notification_SchemaModel";
import { redis } from "../../config/redis";

export const create_Notification = async (
  hotelKey: string,
  infoData: any,
  messageType: "orderSuccess" | "cancelOrder",
  recipientRole?: "staff" | "guest" | "manager"
) => {
  try {
    // ------------------------
    // 1️⃣ Validate inputs
    // ------------------------
    if (!hotelKey || typeof hotelKey !== "string") {
      console.error("❌ Missing or invalid hotelKey");
      return null;
    }

    if (!infoData || typeof infoData !== "object") {
      console.error("❌ Missing or invalid infoData");
      return null;
    }

    // ------------------------
    // 2️⃣ Prepare formatted date and time
    // ------------------------
    const orderDate = new Date();
    const formattedDate = orderDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = orderDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // ------------------------
    // 3️⃣ Prepare order info (type + table)
    // ------------------------
    const orderTypeLabel =
      infoData.orderType === "dining" ? "Dining" : "Parcel";
    const tableInfo =
      infoData.orderType === "dining" && infoData.tableNumber
        ? ` for Table ${infoData.tableNumber}`
        : "";

    // ------------------------
    // 4️⃣ Build message content based on messageType
    // ------------------------
    let messageContent = "";

    if (messageType === "orderSuccess") {
      // ✅ Order placed message
      messageContent = `✅ ${orderTypeLabel} Order ${infoData.orderId}${tableInfo} was successfully placed on ${formattedDate} at ${formattedTime}.`;
    } else if (messageType === "cancelOrder") {
      // ❌ Order canceled message
      let canceledBy = recipientRole || "unknown";
      let kitchenReason = infoData?.kitchOrdercancelationReason;
      let guestReason = infoData?.orderCancelationReason;

      // Customize message based on recipient role
      if (recipientRole === "staff") {
        if (canceledBy === "staff") {
          messageContent = `❌ ${orderTypeLabel} Order ${
            infoData.orderId
          }${tableInfo} was canceled by Kitchen on ${formattedDate} at ${formattedTime}.${
            kitchenReason ? " Reason: " + kitchenReason : ""
          }`;
        } else if (canceledBy === "guest") {
          messageContent = `❌ ${orderTypeLabel} Order ${
            infoData.orderId
          }${tableInfo} was canceled by Guest on ${formattedDate} at ${formattedTime}.${
            guestReason ? " Reason: " + guestReason : ""
          }`;
        } else {
          messageContent = `❌ ${orderTypeLabel} Order ${
            infoData.orderId
          }${tableInfo} was canceled on ${formattedDate} at ${formattedTime}.${
            guestReason ? " Reason: " + guestReason : ""
          }`;
        }
      } else if (recipientRole === "guest") {
        // Guest sees who canceled the order
        messageContent = `❌ ${orderTypeLabel} Order ${
          infoData.orderId
        }${tableInfo} was canceled by ${canceledBy} on ${formattedDate} at ${formattedTime}.${
          guestReason ? " Reason: " + guestReason : ""
        }`;
      } else {
        // Manager or default case
        messageContent = `❌ ${orderTypeLabel} Order ${
          infoData.orderId
        }${tableInfo} was canceled by ${canceledBy} on ${formattedDate} at ${formattedTime}.${
          kitchenReason ? " Reason: " + kitchenReason : ""
        }`;
      }
    }

    // ------------------------
    // 5️⃣ Try to load existing users (manager + staff) from Redis cache
    // ------------------------
    const redisKey = `notification_userse_Id${hotelKey}`;
    let existUsers = await redis.get(redisKey);

    if (!existUsers) {
      // ------------------------
      // 6️⃣ Cache miss → Fetch from MongoDB
      // ------------------------
      const [managerDoc, staffDocs] = await Promise.all([
        ManagerProfileSchema.findOne({ _id: hotelKey, isDeleted: false })
          .lean()
          .select("_id"),
        StaffProfileSchema.find({ hotelKey, isDeleted: false })
          .lean()
          .select("staffId -_id"),
      ]);

      // If no manager found, skip
      if (!managerDoc) {
        console.warn("⚠️ Manager not found for hotelKey:", hotelKey);
        return null;
      }

      // Extract manager + staff IDs
      const managerId = managerDoc._id.toString();
      const staffIds = staffDocs.map((s: { staffId: string }) => s.staffId);

      // Combine all users into one list
      existUsers = [managerId, ...staffIds];

      // ------------------------
      // 7️⃣ Store in Redis cache (1 Day expiry)
      // ------------------------
      await redis.set(redisKey, JSON.stringify(existUsers), { ex: 86400 });
    }

    // ------------------------
    // 8️⃣ Create and save notification document in MongoDB
    // ------------------------
    const message = new NotificationSchemaModel({
      hotelKey,
      messageType,
      existUsers,
      messageContent,
    });

    await message.save();

    console.log("📢 Notification created:", messageContent);
    return;
  } catch (error) {
    // ------------------------
    // 9️⃣ Error handling
    // ------------------------
    console.error("❌ Error creating notification:", error);
    return null;
  }
};
