import { Server, Socket } from "socket.io";
import OrderSchemaModel from "../../../models/orders/order_SchemaModel";
import { redis } from "../../../config/redis";
import GuestProfileSchema from "../../../models/guest/guest_ProfileSchemaModel";

/**
 * Hotel Guest Orders Room - Handles socket events for guest order management
 * Manages real-time order updates for guest users with Redis caching
 * 
 * @param _io - Socket.IO Server instance (unused in this module but kept for consistency)
 * @param socket - Individual socket connection for event handling
 */
export default function hotelGuestOrdersRoom(_io: Server, socket: Socket) {
  /**
   * Event: joinHotelGuestOrdersChannel
   * Handles guest users joining their specific hotel guest orders channel
   * Fetches guest orders with Redis caching for performance optimization
   * 
   * @param hotelKey - Unique identifier for the hotel
   * @param userId - Unique identifier for the guest user (mobile number)
   */
  socket.on("joinHotelGuestOrdersChannel", async ({ hotelKey, userId }) => {
    try {
      // Validate required parameters
      if (!hotelKey || !userId) return console.warn("❌ Missing parameters");

      // Join the hotel and user specific room for real-time updates
      socket.join(`${hotelKey}${userId}`);
      console.log(`✅ Joined hotel room:${hotelKey}${userId}`);

      // Redis cache key for guest orders
      const redisKey = `guestOrders-list:${hotelKey}:${userId}`;
      
      // Check Redis cache first for performance optimization
      const cachedData = await redis.get(redisKey);
      if (cachedData) return socket.emit("initialGuestOrders", cachedData);

      // Fetch guest profile to get current orders
      const guestProfile = await GuestProfileSchema.findOne({
        mobileNumber: userId, // Find guest by mobile number (userId)
      })
        .lean() // Use lean for better performance
        .select("-_id currentOrders"); // Select only currentOrders field, exclude _id

      // Return empty array if no guest profile found
      if (!guestProfile) return socket.emit("initialGuestOrders", []);

      // ✅ Filter currentOrders by hotelKey to get orders for specific hotel
      const matchedOrders = guestProfile.currentOrders.filter(
        (order) => order.hotelId === hotelKey
      );

      // Extract orderIds from matched orders for database query
      const orderIds = matchedOrders.map((order) => order.orderId);
      let orders = [];

      // Fetch complete order details from orders collection if orderIds exist
      if (orderIds.length) {
        orders = await OrderSchemaModel.find({
          orderId: { $in: orderIds }, // Find orders with matching IDs
          isDeleted: false, // Exclude soft-deleted orders
        })
          .lean() // Use lean for better performance
          .select("-__v"); // Exclude version key

        // Cache the fetched orders in Redis for 3 hours (10800 seconds)
        await redis.set(redisKey, JSON.stringify(orders), { ex: 10800 });
      }

      // Send initial guest orders to the connected client
      socket.emit("initialGuestOrders", orders);
      
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("❌ Error in joinHotelGuestOrdersChannel:", error);
      
      // Send empty array as fallback to ensure client doesn't break
      socket.emit("initialGuestOrders", []);
    }
  });
}