import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { Server as SocketIOServer } from "socket.io";
import { sendOrderNotification } from "../emailServices/orderNotificationService";
import { type OrderData } from "../emailServices/orderNotificationService";

// ==========================
// 🔹 Router Initialization
// ==========================
const post_confirm_Order_Router = Router();

// ==========================
// 🔹 POST Endpoint: Confirm Order
// ==========================
post_confirm_Order_Router.post(
  "/api/v1/:role/orders/confirm-Order",
  verifyToken(""), // Middleware to verify token
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ==========================
      // 🔹 Extract Request Data
      // ==========================
      const { orderId } = req.body;
      const role = req.params.role?.toLowerCase().trim() || "";

      // ==========================
      // 🔹 Role Validation
      // ==========================
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, message: "Hotel key missing" });
      }

      // ==========================
      // 🔹 Fetch Order from Database
      // ==========================
      const order = await OrderSchemaModel.findOne({
        hotelKey,
        orderId,
        isDeleted: false,
        orderCancelled: false,
        orderAccepted: false,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ==========================
      // 🔹 Update Order Status
      // ==========================
      order.orderAccepted = true;
      await order.save();

      // ==========================
      // 🔹 Emit Order via Socket.IO
      // ==========================
      const io = req.app.get("io") as SocketIOServer;
      io.emit("confirmOrders", order);

      res.status(200).json({ message: "Order approved successfully" });

      if (order?.email) {
        await sendOrderNotification(hotelKey, order as OrderData, "confirm");
      }

      return;
    } catch (error) {
      console.error(error);

      // ==========================
      // 🔹 Error Handling
      // ==========================
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default post_confirm_Order_Router;
