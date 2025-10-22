import { Router, Response } from "express";
import { MultiUserRequest } from "../../types/user";
import { redis } from "../../config/redis";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

const guest_date_OrderHistory_Router = Router();

/**
 * @route   GET /api/v1/:role/get/orders-date
 * @desc    Fetch all orders for a specific user (guest/staff/etc.) by date
 * @access  Protected (enable verifyToken when ready)
 */
guest_date_OrderHistory_Router.get(
  "/api/v1/:role/get/orders-date",
  verifyToken(""), // 🔒 Enable when token verification is required
  async (req: MultiUserRequest, res: Response) => {
    try {
      // 🔹 Extract role and normalize
      const role = req.params.role?.toLowerCase().trim() || "";

      // 🔹 Get user and hotel info dynamically
      const userId = req[role as keyof MultiUserRequest]?.userId;
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // 🔹 Validate required params
      if (!userId || !hotelKey) {
        return res.status(400).json({
          success: false,
          message: "Missing user or hotel information.",
        });
      }

      // 🔹 Construct Redis key for this user's orders
      const redisKey = `guestOrders-list:${hotelKey}:${userId}`;

      // 🔹 Try to fetch from Redis cache first
      const cachedData = await redis.get(redisKey);

      if (cachedData) {
        return res.status(200).json({
          success: true,
          message: "Fetched order dates successfully (from Redis).",
          data: cachedData,
        });
      }

      // 🔹 Fetch from MongoDB if not cached
      const orders = await OrderSchemaModel.find({
        hotelKey,
        orderedById: userId,
      })
        .lean()
        .select("orderId createdAt -_id")
        .sort({ createdAt: -1 }); // Sort newest first

      // / 🔹 Store fresh result in Redis (TTL: 5 minutes)
      await redis.set(redisKey, JSON.stringify(orders), { ex: 300 });

      // 🔹 Return successful response
      return res.status(200).json({
        success: true,
        message: "Fetched order dates successfully.",
        data: orders,
      });
    } catch (error: any) {
      console.error("❌ Error fetching order history by date:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

export default guest_date_OrderHistory_Router;
