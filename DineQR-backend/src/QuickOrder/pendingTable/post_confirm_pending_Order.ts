import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { sendOrderNotification } from "../emailServices/orderNotificationService";
import { type OrderData } from "../emailServices/orderNotificationService";
import { create_Notification } from "../notification/post_create_Notification";
import { Server as SocketIOServer } from "socket.io";
import { redis } from "../../config/redis";
import { guest_Notifications } from "../../guest/notification/guest_Notifications";

const post_confirm_pending_Order = Router();

/**
 * 🔹 Confirm and deliver a pending order
 * Endpoint: POST /api/v1/:role/orders/confirm/pending-Order
 * Body: { orderId: string }
 * Middleware: verifyToken (authenticates user and adds role-specific data)
 */
post_confirm_pending_Order.post(
  "/api/v1/:role/orders/confirm/pending-Order",
  verifyToken(""), // Token verification middleware
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ==============================================
      // 🧩 REQUEST DATA EXTRACTION
      // ==============================================

      // Extract orderId from request body
      const { orderId } = req.body;

      // Extract role from URL parameter and normalize
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
      // 🧩 USER AND HOTEL INFORMATION EXTRACTION
      // ==============================================

      // Extract hotelKey and userId from request based on role
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      const userId = req[role as keyof MultiUserRequest]?.userId;

      // Validate that hotelKey and userId are present
      if (!hotelKey || !userId) {
        return res
          .status(400)
          .json({ success: false, error: "Hotel key or userId missing" });
      }

      // ==============================================
      // 🧩 ORDER ID VALIDATION
      // ==============================================

      // Validate that orderId is provided in request body
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      // ==============================================
      // 🧩 ORDER DATABASE LOOKUP
      // ==============================================

      // Find the order in database with specific criteria:
      // - Matching hotelKey and orderId
      // - Not deleted or cancelled
      // - Already accepted but not yet delivered
      const order = await OrderSchemaModel.findOne({
        hotelKey,
        orderId,
        isDeleted: false,
        orderCancelled: false,
        orderAccepted: true,
        orderDelivered: false,
      });

      // Return error if order not found
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ==============================================
      // 🧩 ORDER STATUS UPDATE
      // ==============================================

      // Update order status to delivered and save to database
      order.orderDelivered = true;
      await order.save();

      // ==============================================
      // 🧩 SUCCESS RESPONSE
      // ==============================================

      // Return success response to client
      res.status(200).json({ message: "Pending Order accepted successfully" });

      // ==============================================
      // 🧩 EMAIL NOTIFICATION
      // ==============================================

      // Send email notification to customer if email exists
      if (order?.email) {
        await sendOrderNotification(hotelKey, order as OrderData, "deliverd");
      }

      // ==============================================
      // 🧩 REAL-TIME NOTIFICATION
      // ==============================================

      // Create real-time notification for manager & staff
      const io = req.app.get("io") as SocketIOServer;
      if (order.orderedBy === "guest") {
        io.to(`${hotelKey}${order?.orderedById}`).emit(
          "updateGuestOrders",
          order
        );

        const redisKey = `guestOrders-list:${hotelKey}:${order?.orderedById}`;
        await redis.del(redisKey);
        await guest_Notifications(io, order, "⭐completed");
      }

      io.emit("orderDelivered", orderId);
      await create_Notification(hotelKey, order, "orderSuccess", undefined, io);

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

export default post_confirm_pending_Order;
