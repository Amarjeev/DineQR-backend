import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { sendOrderNotification } from "../emailServices/orderNotificationService";
import { type OrderData } from "../emailServices/orderNotificationService";
import { create_Notification } from "../notification/post_create_Notification";
import { Server as SocketIOServer } from "socket.io";

const post_Reject_Order_Router = Router();

// ==============================================
// 🧩 KITCHEN CANCELLATION REASONS
// ==============================================

// Predefined array of valid cancellation reasons for kitchen orders
// This ensures consistency and prevents arbitrary rejection reasons
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
 * Endpoint: POST /api/v1/:role/orders/reject-Order
 * Body: { orderId: string, rejectionReason: string }
 * Middleware: verifyToken (authenticates user and adds role-specific data)
 */
post_Reject_Order_Router.post(
  "/api/v1/:role/orders/reject-Order",
  verifyToken(""), // Token verification middleware
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ==============================================
      // 🧩 REQUEST DATA EXTRACTION
      // ==============================================
      
      // Extract orderId and rejectionReason from request body
      const { orderId, rejectionReason } = req.body;
      
      // Extract role from URL parameter and normalize to lowercase
      const role = req.params.role?.toLowerCase().trim() || "";

      // ==============================================
      // 🧩 ROLE VALIDATION
      // ==============================================
      
      // Validate that role is one of the allowed values
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // ==============================================
      // 🧩 HOTEL KEY VALIDATION
      // ==============================================
      
      // Extract hotelKey from the request object (added by verifyToken middleware)
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // Validate that hotelKey is present
      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, error: "Hotel key missing" });
      }

      // ==============================================
      // 🧩 INPUT VALIDATION
      // ==============================================
      
      // Validate that both orderId and rejectionReason are provided
      if (!orderId && !rejectionReason) {
        return res
          .status(400)
          .json({ message: "Order ID and rejection reason are required" });
      }

      // ==============================================
      // 🧩 REJECTION REASON VALIDATION
      // ==============================================
      
      // Validate rejectionReason against predefined allowed reasons
      if (!KitchenCancelationReasonsArray.includes(rejectionReason)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rejection reason.",
        });
      }

      // ==============================================
      // 🧩 ORDER DATABASE LOOKUP
      // ==============================================
      
      // Find the order in database with specific criteria:
      // - Matching hotelKey and orderId
      // - Not deleted or already cancelled
      // - Not previously cancelled by kitchen
      const order = await OrderSchemaModel.findOne({
        hotelKey,
        orderId,
        isDeleted: false,
        orderCancelled: false,
        kitchOrderCancelation: false,
      }).select(
        "kitchOrderCancelation kitchOrdercancelationReason orderId orderType tableNumber orderedBy email createdAt items orderId kitchOrdercancelationReason orderCancelationReason"
      );

      // Return error if order not found
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ==============================================
      // 🧩 ORDER STATUS UPDATE
      // ==============================================
      
      // Update order cancellation status and reason
      order.kitchOrderCancelation = true;
      order.kitchOrdercancelationReason = rejectionReason;
      await order.save();

      // ==============================================
      // 🧩 SUCCESS RESPONSE
      // ==============================================
      
      // Return success response to client
      res.status(200).json({ message: "Order rejected successfully" });

      // ==============================================
      // 🧩 EMAIL NOTIFICATION
      // ==============================================
      
      // Send cancellation email notification to customer if email exists
      if (order?.email) {
        await sendOrderNotification(
          hotelKey,
          order as OrderData,
          "cancel",
          rejectionReason
        );
      }

      // ==============================================
      // 🧩 REAL-TIME NOTIFICATION
      // ==============================================
      
      // Create real-time notification for relevant users
      const io = req.app.get("io") as SocketIOServer;
       io.emit("orderDelivered", orderId);
      await create_Notification(hotelKey,order,"cancelOrder",role as "manager" | "staff" | "guest",io);
      
      return;
    } catch (error) {
      // ==============================================
      // 🧩 ERROR HANDLING
      // ==============================================
      
      console.error(error);
      // Return server error in case of exception
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default post_Reject_Order_Router;