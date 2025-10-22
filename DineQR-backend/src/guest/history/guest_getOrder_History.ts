import { Router, Response } from "express";
import { MultiUserRequest } from "../../types/user";
import { redis } from "../../config/redis";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

const guest_getOrder_History_Router = Router();

/**
 * @route   GET /api/v1/:role/get/order/:orderId
 * @desc    Fetch a specific order's full details for a guest/staff by orderId
 * @access  Protected (via verifyToken)
 */
guest_getOrder_History_Router.get(
  "/api/v1/:role/get/order/:orderId",
  verifyToken(""), // 🔒 Protect the route
  async (req: MultiUserRequest, res: Response) => {
    try {
      // 🔹 Extract role and normalize
      const role = req.params.role?.toLowerCase().trim() || "";

      // 🔹 Get user and hotel info dynamically
      const userId = req[role as keyof MultiUserRequest]?.userId;
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // 🔹 Extract orderId from params
      const { orderId } = req.params;

      // 🔹 Validate required params
      if (!userId || !hotelKey || !orderId) {
        return res.status(400).json({
          success: false,
          message: "Missing user, hotel, or order information.",
        });
      }

      // 🔹 Construct Redis key for this specific order
      const redisKey = `guestOrder:${hotelKey}:${userId}:${orderId}`;

      // 🔹 Try to fetch from Redis cache first
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          message: "Fetched order successfully (from Redis).",
          data: cachedData,
        });
      }

      // 🔹 Fetch from MongoDB if not cached
      const order = await OrderSchemaModel.findOne({
        hotelKey,
        orderedById: userId,
        orderId,
      }).lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      // 🔹 Store fresh result in Redis (TTL: 5 minutes)
      await redis.set(redisKey, JSON.stringify(order), { ex: 300 });

      // 🔹 Return successful response
      return res.status(200).json({
        success: true,
        message: "Fetched order successfully.",
        data: order,
      });
    } catch (error: any) {
      console.error("❌ Error fetching order history:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

export default guest_getOrder_History_Router;
