import { Server, Socket } from "socket.io";
import GuestProfileSchema, {
  INotification,
} from "../../../models/guest/guest_ProfileSchemaModel";
import { redis } from "../../redis";

/**
 * Guest Notification Room
 * -----------------------
 * Handles real-time notifications for hotel guests.
 * Each guest joins a room specific to their hotel.
 * Sends only active (non-expired) notifications for that hotel.
 */
export default function hotelGuestNotificationRoom(
  _io: Server,
  socket: Socket
) {
  /**
   * Event: joinHotelGuestNotificationChannel
   * ----------------------------------------
   * Triggered when a guest wants to join their hotel-specific notification channel.
   * Fetches and sends all relevant notifications to the guest.
   */
  socket.on(
    "joinHotelGuestNotificationChannel",
    async ({
      hotelKey,
      guestUserId,
    }: {
      hotelKey: string;
      guestUserId: string;
    }) => {
      try {
        // ✅ Validate required parameters
        if (!hotelKey || !guestUserId) {
          console.warn("❌ Missing hotelKey or guestUserId");
          return;
        }

        // ✅ Construct a unique room ID for this guest + hotel
        const roomId = `${hotelKey}${guestUserId}`;
        socket.join(roomId);
        console.log(`✅ Guest joined notification room: ${roomId}`);

        // ✅ Check Redis cache first to reduce DB queries
        const redisKey = `guestOrders-notification:${hotelKey}:${guestUserId}`;
        const cached = await redis.get(redisKey);
        if (cached) {
          // ✅ Emit cached notifications if available and skip DB query
          socket.emit("initialGuestNotifications", cached);
          return;
        }

        // ✅ Current timestamp to filter out expired notifications
        const now = new Date();

        // ✅ Fetch notifications from MongoDB for this guest
        // Filters by hotelId and ensures notifications are not expired
        const guestData = await GuestProfileSchema.aggregate([
          { $match: { mobileNumber: guestUserId } }, // match guest by mobile
          {
            $project: {
              _id: 0,
              notifications: {
                $filter: {
                  input: "$notifications", // input array to filter
                  as: "notif", // variable name for each notification
                  cond: {
                    $and: [
                      { $eq: ["$$notif.hotelId", hotelKey] }, // match hotel
                      { $gt: ["$$notif.expireAt", now] }, // not expired
                    ],
                  },
                },
              },
            },
          },
        ]);

        // ✅ Extract notifications array from aggregation result
        const notifications: INotification[] =
          guestData?.[0]?.notifications || [];

        // ✅ Sort notifications so the newest appear first
        notifications.sort(
          (a: INotification, b: INotification) =>
            +new Date(b.createdAt) - +new Date(a.createdAt)
        );

        // ✅ Emit the sorted notifications to the guest client
        socket.emit("initialGuestNotifications", notifications);

        // ✅ Cache the notifications in Redis for 3 hours (10800 seconds)
        await redis.set(redisKey, JSON.stringify(notifications), { ex: 10800 });

        console.log(
          `📨 Sent ${notifications.length} hotel-specific notifications to guest ${guestUserId}`
        );
      } catch (error) {
        // ❌ Handle any errors during fetching or emitting notifications
        console.error("❌ Error fetching hotel-specific notifications:", error);
        socket.emit("notificationError", {
          message: "Failed to fetch hotel-specific notifications.",
        });
      }
    }
  );
}
