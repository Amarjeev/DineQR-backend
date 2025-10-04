// post_Confirm_Orders_Router.ts
import { Router, Response } from "express";
import { verifyToken } from "../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../types/user";
import OrderSchemaModel from "../models/orders/order_SchemaModel";

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

      if (!hotelKey) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - hotelKey missing",
        });
      }

      // Create new order
      const newOrder = new OrderSchemaModel({
        ...orderData,
        hotelKey, // Add hotelKey from token
        orderAccepted: false, // default
        orderCancelled: false, // default
        isDeleted: false, // default
      });

      // Save order to database
      await newOrder.save();

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
