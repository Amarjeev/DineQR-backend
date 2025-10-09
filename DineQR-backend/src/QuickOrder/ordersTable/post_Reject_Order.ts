import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";

const post_Reject_Order_Router = Router();

/**
 * 🔹 Reject an order by ID
 * Endpoint: POST /api/v1/:role/reject-Order
 * Body: { orderId: string }
 * Middleware: verifyToken (authenticates user and adds role-specific data)
 */
post_Reject_Order_Router.post(
  "/api/v1/:role/orders/reject-Order",
  verifyToken(""), // Token verification middleware
  async (req: MultiUserRequest, res: Response) => {
    try {
      const { orderId } = req.body; // Extract orderId from request body
      const role = req.params.role?.toLowerCase().trim() || ""; // Extract role from URL parameter
      // 🔹 Validate role
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // 🔹 Extract hotelKey from the request object (added by verifyToken)
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // 🔹 Check if hotelKey exists
      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, error: "Hotel key missing" });
      }

      // 🔹 Validate orderId
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      // 🔹 Find the order in the database using hotelKey and orderId
      const order = await OrderSchemaModel.findOne({
        hotelKey,
        orderId,
        isDeleted: false,
        orderCancelled: false,
      }).select('orderCancelled');

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 🔹 Update order status to cancelled
      order.orderCancelled = true;
      await order.save();

      // 🔹 Return success response
      return res
        .status(200)
        .json({ message: "Order rejected successfully", order });
    } catch (error) {
      console.error(error);
      // 🔹 Return server error in case of exception
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default post_Reject_Order_Router;
