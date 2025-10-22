import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import OrderSchemaModel from "../../models/orders/order_SchemaModel";
import { Server as SocketIOServer } from "socket.io";
import { generateOrderId } from "./generateOrderId";
import GuestProfileSchema from "../../models/guest/guest_ProfileSchemaModel";
import { redis } from "../../config/redis";

// ================================
// ✅ Express Router: Confirm Cart Orders
// Saves a new order to the database and notifies clients via Socket.IO
// ================================
const post_Confirm_Cart_Orders_Router = Router();

/**
 * @route   POST /api/v1/:role/post/confirm/orders
 * @desc    Confirm a cart order and save to DB
 * @access  Protected (JWT required)
 */
post_Confirm_Cart_Orders_Router.post(
  "/api/v1/:role/post/confirm/orders",
  verifyToken(""), // 🔹 Middleware validates JWT and attaches role + hotelKey
  async (req: MultiUserRequest, res: Response) => {
    try {
      // 🔹 Extract role and order data
      const role = req.params.role?.toLowerCase().trim() || "";
      const orderData = req.body;

      // 🔹 Validate role
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // 🔹 Extract hotelKey and user role from request (added by verifyToken)
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      const userType = req[role as keyof MultiUserRequest]?.role;
      const userId = req[role as keyof MultiUserRequest]?.userId;

      // 🔹 Generate a unique order ID
      const orderId = generateOrderId();

      // 🔹 Ensure hotelKey, userType, and orderId exist
      if (!hotelKey || !userType || !orderId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - hotelKey, userRole, or orderId missing",
        });
      }

      const mobileNumberToSave = userType === "guest" ? userId : undefined;

      // 🔹 Create a new order object
      const newOrder = new OrderSchemaModel({
        ...orderData,
        hotelKey,
        mobileNumber: mobileNumberToSave || orderData?.mobileNumber, // Only save for guest
        orderedBy: userType,
        orderedById: userId,
        orderId,
        orderAccepted: false, // default status
        orderCancelled: false, // default status
        isDeleted: false, // default status
      });

      // 🔹 Save the order to MongoDB
      await newOrder.save();

      if (userType === "guest") {
        await GuestProfileSchema.findOneAndUpdate(
          { mobileNumber: mobileNumberToSave },
          {
            $push: {
              currentOrders: {
                orderId: orderId,
                hotelId: hotelKey,
                expireAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours TTL
              },
            },
          },
          { upsert: true, new: true }
        );

        const redisKey = `guestOrders-list:${hotelKey}:${userId}`;
        await redis.del(redisKey);
      }

      // 🔹 Get Socket.IO instance from Express app
      const io = req.app.get("io") as SocketIOServer;

      // 🔔 Emit the new order to all clients (can be restricted to hotel staff only)
      io.emit("newOrder", newOrder);

      // 🔹 Respond with success
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

// ✅ Export router to use in main server
export default post_Confirm_Cart_Orders_Router;
