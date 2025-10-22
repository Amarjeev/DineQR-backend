// ================================
// 📦 Imports
// ================================
import { Router, Response } from "express";
import GuestProfileSchema from "../../models/guest/guest_ProfileSchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import { redis } from "../../config/redis";

// ================================
// ✅ Initialize router for guest order deletion
// ================================
const guest_del_Orders_Router = Router();

// ================================
// DELETE Guest Order API
// ================================
guest_del_Orders_Router.delete(
  "/api/v1/:role/delete/guest-order", // Endpoint with role parameter
  verifyToken(""), // Middleware to verify token; supports role-based access
  async (req: MultiUserRequest, res: Response) => {
    try {
      // 🔹 Extract orderId from request body
      const { orderId } = req.body;

      // 🔹 Validate orderId presence
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "orderId is required",
        });
      }

      // 🔹 Extract role from route params and normalize
      const role = req.params.role?.toLowerCase().trim() || "";

      // 🔹 Extract userId (mobile number) and hotelKey from request object based on role
      const userId = req[role as keyof MultiUserRequest]?.userId;
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // 🔹 Validate userId existence
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID not found",
        });
      }

      // 🔹 MongoDB operation: Remove the specific order from currentOrders array
      // $pull operator removes array elements that match the given condition
      const updatedGuest = await GuestProfileSchema.findOneAndUpdate(
        { mobileNumber: userId },           // Find the guest by mobile number
        { $pull: { currentOrders: { orderId } } }, // Remove the order with matching orderId
        { new: true }                        // Return the updated document
      );

      // 🔹 Handle case where guest not found or orderId invalid
      if (!updatedGuest) {
        return res.status(404).json({
          success: false,
          message: "Guest not found or orderId invalid",
        });
      }

      // 🔹 Invalidate cache in Redis for this guest's orders
      // This ensures the next fetch retrieves fresh data
      const redisKey = `guestOrders-list:${hotelKey}:${userId}`;
      await redis.del(redisKey);

      // 🔹 Respond with success
      return res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error: any) {
      // 🔹 Handle unexpected errors
      console.error("❌ Error deleting order:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// ✅ Export the router to use in the main server file
export default guest_del_Orders_Router;
 