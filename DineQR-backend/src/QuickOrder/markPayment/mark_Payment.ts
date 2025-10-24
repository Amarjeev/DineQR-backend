import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { redis } from "../../config/redis";

const mark_Paid_Router = Router();

mark_Paid_Router.post(
  "/api/v1/:role/orders/mark-paid/:orderId",
  verifyToken(""), // verify user
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role?.toLowerCase().trim();
      const orderId = req.params.orderId;
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // Find order
      const order = await Order_Schema.findOne({ hotelKey, orderId });
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // Update paymentStatus manually
      order.paymentStatus = true;
      await order.save();

      // 🔹 Invalidate cache in Redis for this guest's orders
      // This ensures the next fetch retrieves fresh data
      const redisKey = `guestOrders-list:${hotelKey}:${order.orderedById}`;
      await redis.del(redisKey);

      res
        .status(200)
        .json({ message: "Order marked as paid manually", success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating payment status" });
    }
  }
);

export default mark_Paid_Router;
