import { Router, Response } from "express";
import { MultiUserRequest } from "../../types/user";
import { redis } from "../../config/redis";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

const guest_date_OrderHistory_Router = Router();

/**
 * @route   GET /api/v1/:role/get/orders-date
 * @desc    Fetch all orders for a specific user (guest/staff/etc.) by date
 * @access  Protected
 */
guest_date_OrderHistory_Router.get(
  "/api/v1/:role/get/orders-date",
  verifyToken(""), // Enable token verification
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role?.toLowerCase().trim() || "";
      const userId = req[role as keyof MultiUserRequest]?.userId;
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      if (!userId || !hotelKey) {
        return res.status(400).json({
          success: false,
          message: "Missing user or hotel information.",
        });
      }

      const redisKey = `guestOrders-list:${hotelKey}:${userId}`;

      // Try to fetch from Redis cache
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          message: "Fetched order dates successfully (from Redis).",
          data: cachedData,
        });
      }

      // Fetch orders from MongoDB
      const orders = await OrderSchemaModel.find({
        hotelKey,
        orderedById: userId,
      })
        .lean()
        .select("orderId createdAt -_id")
        .sort({ createdAt: -1 }); // newest first

      interface OrderItem {
        orderId: string;
        createdAt: string | Date;
      }
      // Step 1: Group orders by date (you already have this)
      const grouped = (orders as OrderItem[]).reduce((acc, order) => {
        if (!order.createdAt) return acc;

        const date = new Date(order.createdAt)
          .toISOString()
          .split("T")[0] as string;

        if (!acc[date]) acc[date] = [];
        if (order.orderId) acc[date].push(order.orderId);

        return acc;
      }, {} as Record<string, string[]>);

      // Step 2: Convert grouped object to array of objects
      const groupedArray = Object.keys(grouped)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // newest first
        .map((date) => ({
          date, // heading
          orders: grouped[date], // array of orderIds
        }));

      // Store result in Redis (TTL: 5 minutes)
      await redis.set(redisKey, JSON.stringify(groupedArray), { ex: 300 });

      // Return response
      return res.status(200).json({
        success: true,
        message: "Fetched order dates successfully.",
        data: groupedArray,
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
