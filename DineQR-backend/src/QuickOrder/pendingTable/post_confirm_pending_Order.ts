import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { sendOrderNotification } from "../emailServices/orderNotificationService";
import { type OrderData } from "../emailServices/orderNotificationService";
// import { Server as SocketIOServer } from "socket.io";

const post_confirm_pending_Order = Router();

/**
 * 🔹 Reject an order by ID
 * Endpoint: POST /api/v1/:role/confirm-Order
 * Body: { orderId: string }
 * Middleware: verifyToken (authenticates user and adds role-specific data)
 */
post_confirm_pending_Order.post(
  "/api/v1/:role/orders/confirm/pending-Order",
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
        orderAccepted: true,
        orderDelivered: false,
      }).select("orderDelivered email items orderId tableNumber");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 🔹 Update order status to cancelled
      order.orderDelivered = true;
      await order.save();
      // 🔹 Return success response
      res.status(200).json({ message: "Pending Order accepted successfully" });

      // 🔹 Get Socket.IO instance from Express app
      // const io = req.app.get("io") as SocketIOServer;

      // // 🔔 Emit the new order to all clients (can be restricted to hotel staff only)
      // io.emit("confirmOrders", order);


      if (order?.email) {
           await sendOrderNotification(hotelKey,order as OrderData,'deliverd')
      }

      return
    } catch (error) {
      console.error(error);
      // 🔹 Return server error in case of exception
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default post_confirm_pending_Order;
