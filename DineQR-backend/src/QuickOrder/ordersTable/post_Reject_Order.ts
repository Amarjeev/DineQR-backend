import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { sendOrderNotification } from "../emailServices/orderNotificationService";
import { type OrderData } from "../emailServices/orderNotificationService";

const post_Reject_Order_Router = Router();

const KitchenCancelationReasonsArray = [
  "Out of ingredients",
  "Kitchen overloaded",
  "Item not available",
  "Technical issue",
  "Customer request",
  "Quality concerns",
  "Other reason",
];

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
      const { orderId, rejectionReason } = req.body; // Extract orderId from request body
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
      if (!orderId && !rejectionReason) {
        return res
          .status(400)
          .json({ message: "Order ID and rejection reason are required" });
      }

      // 🔹 Validate rejectionReason against allowed reasons
      if (!KitchenCancelationReasonsArray.includes(rejectionReason)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rejection reason.",
        });
      }

      // 🔹 Find the order in the database using hotelKey and orderId
      const order = await OrderSchemaModel.findOne({
        hotelKey,
        orderId,
        isDeleted: false,
        orderCancelled: false,
        kitchOrderCancelation: false,
      }).select(
        "kitchOrderCancelation kitchOrdercancelationReason email createdAt items orderId"
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 🔹 Update order status to cancelled
      order.kitchOrderCancelation = true;
      order.kitchOrdercancelationReason = rejectionReason;
      await order.save();

      // 🔹 Return success response
      res.status(200).json({ message: "Order rejected successfully" });

      if (order?.email) {
        await sendOrderNotification(
          hotelKey,
          order as OrderData,
          "cancel",
          rejectionReason
        );
      }

      return;
    } catch (error) {
      console.error(error);
      // 🔹 Return server error in case of exception
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default post_Reject_Order_Router;
