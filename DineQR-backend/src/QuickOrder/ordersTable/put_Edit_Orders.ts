import { Router, Request, Response } from "express";
import Order_Schema from "../../models/orders/order_SchemaModel";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";

// ================================
// 🔹 Types & Interfaces
// ================================

// Portion interface representing a single portion of an item
interface Portion {
  portion: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// UpdatedPortions type representing new quantities keyed by portion name
interface UpdatedPortions {
  [portionName: string]: number; // Example: { full: 2, half: 1 }
}

// ================================
// ✅ Router Setup
// ================================
const put_Edit_Orders_Router = Router();

// ================================
// PUT /api/v1/orders/update-item-quantities
// Updates the quantities of portions for a specific order item
// Only staff can access
// ================================
put_Edit_Orders_Router.put(
  "/api/v1/orders/update-item-quantities",
  verifyToken("staff"), // 🔹 Protect route: staff only
  async (req: Request, res: Response) => {
    try {
      // 🔹 Destructure and type request body
      const { orderId, itemId, updatedPortions } = req.body as {
        orderId: string;
        itemId: string;
        updatedPortions: UpdatedPortions;
      };

      // 🔹 Validate required fields
      if (!orderId || !itemId || !updatedPortions) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: orderId, itemId, or updatedPortions",
        });
      }

      // 🔹 Find the order by orderId
      const order = await Order_Schema.findOne({ orderId });
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // 🔹 Find the item by _id in order.items
      const item = (order.items as any).id(itemId);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found in order" });
      }

      // 🔹 Update each portion quantity and recalculate subtotal
      item.portions.forEach((portion: Portion) => {
        const newQty = updatedPortions[portion.portion];
        if (newQty !== undefined) {
          portion.quantity = newQty;
          portion.subtotal = (portion.price || 0) * newQty;
        }
      });

      // 🔹 Update order timestamp and save
      order.updatedAt = new Date();
      await order.save();

      // 🔹 Success response
      return res.status(200).json({
        success: true,
        message: "Order item updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Error updating order item:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// ✅ Export the router
export default put_Edit_Orders_Router;
