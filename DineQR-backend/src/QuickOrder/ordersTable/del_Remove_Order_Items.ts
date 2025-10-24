import { Router, Request, Response } from "express";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";


// ================================
// ✅ Express Router: Delete Order Item
// Handles deletion of a single item from an order
// Only accessible to 'staff' users
// ================================
const del_Remove_Order_Items_Router = Router();

// ================================
// 🔹 DELETE Endpoint: /api/v1/orders/delete-item
// Middleware: verifyToken ensures only 'staff' can access
// ================================
del_Remove_Order_Items_Router.delete(
  "/api/v1/orders/delete-item",
  verifyToken("staff"),
  async (req: Request, res: Response) => {
    try {
      // 🔹 Extract orderId and itemId from request body
      const { orderId, itemId } = req.body as {
        orderId: string;
        itemId: string;
      };

      // 🔹 Validate required fields
      if (!orderId || !itemId) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: orderId or itemId",
        });
      }

      // 🔹 Find the order that is not accepted, cancelled, or deleted
      const order = await Order_Schema.findOne({
        orderId,
        orderAccepted: false,
        orderCancelled: false,
        isDeleted: false,
      });

      // 🔹 If order not found, return 404
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // 🔹 Check if the specified item exists in the order
      const itemExists = order.items.find((i) => i._id === itemId);
      if (!itemExists) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found in order" });
      }

      // 🔹 Delete the item or mark order as deleted if it was the last item
      if (order.items.length > 1) {
        // Remove only the specified item
        order.items = order.items.filter((i) => i._id !== itemId);
      } else {
        // Mark the order as deleted instead of leaving empty
        order.isDeleted = true;
      }

      // 🔹 Update timestamp and save changes
      order.updatedAt = new Date();
      await order.save();

      // 🔹 Respond with success message
      return res.status(200).json({
        success: true,
        message: "Item deleted successfully from order",
      });
    } catch (error: any) {
      // 🔹 Handle unexpected server errors
      console.error("❌ Error deleting item from order:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// ✅ Export the router to use in the main server file
export default del_Remove_Order_Items_Router;
