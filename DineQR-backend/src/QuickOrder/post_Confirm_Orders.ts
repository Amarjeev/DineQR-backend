import { Router, Response } from "express";
import { verifyToken } from "../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../types/user";
import OrderSchemaModel from "../models/orders/order_SchemaModel";
import { Server as SocketIOServer } from "socket.io";
import { generateOrderId } from "./generateOrderId";

const post_Confirm_Orders_Router = Router();

/**
 * @route   POST /api/v1/:role/post/confirm/orders
 * @desc    Confirm an order and save to DB
 * @access  Protected (requires valid token)
 */
post_Confirm_Orders_Router.post(
  "/api/v1/:role/post/confirm/orders",
  verifyToken(""), // Middleware attaches role info + hotelKey
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role?.toLowerCase().trim() || "";
      const orderData = req.body;

      // Validate role
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // Get hotelKey from request (added by verifyToken middleware)
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      const userType = req[role as keyof MultiUserRequest]?.role;
      // Generate user-friendly order ID
      const orderId = generateOrderId();

      if (!hotelKey || !userType || !orderId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - hotelKey or userRole or orderId missing",
        });
      }

      // Create new order
      const newOrder = new OrderSchemaModel({
        ...orderData,
        hotelKey,
        orderedBy: userType,
        orderId,
        orderAccepted: false, // default
        orderCancelled: false, // default
        isDeleted: false, // default
      });

      // Save order to database
      await newOrder.save();
      // 2️⃣ Get the Socket.IO instance from Express app
      const io = req.app.get("io") as SocketIOServer;

      // 🔔 Send the new order to all connected clients
      // NOTE: This currently sends to **everyone**, not just the staff of this hotel
      io.emit("newOrder", newOrder);

      // 💡 If you want to send only to staff of this hotel:
      // io.to(hotelKey).emit("newOrder", newOrder);
      // - `hotelKey` is the unique room for this hotel
      // - Only clients who joined this room will get the event

      return res.status(201).json({
        success: true,
        message: "Order confirmed successfully",
      });
    } catch (error: any) {
      console.error("Error confirming order:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to confirm order",
      });
    }
  }
);

export default post_Confirm_Orders_Router;
