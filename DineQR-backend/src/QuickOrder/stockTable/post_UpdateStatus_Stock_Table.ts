import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import Menu_Item from "../../models/manager/mgr_MenuSchemaModel";
import { create_Notification } from "../notification/post_create_Notification";
import { Server as SocketIOServer } from "socket.io";

const post_UpdateStatus_Stock_Table_Router = Router();

// ============================================================================
// 🎯 Route: Update Stock Item Status
// Route: /api/v1/:role/post/stock/update-status/:itemId/:updateStatus
// ============================================================================
post_UpdateStatus_Stock_Table_Router.post(
  "/api/v1/:role/post/stock-alert/update-status/:itemId/:updateStatus",
  verifyToken(""),
  async (req: MultiUserRequest, res: Response) => {
    try {
      // ------------------------------------------------------------------------
      // 🔹 Extract route parameters
      // ------------------------------------------------------------------------
      const { itemId, updateStatus, role } = req.params;

      // ------------------------------------------------------------------------
      // ⚠️ Validate required parameters
      // ------------------------------------------------------------------------
      if (!itemId || !updateStatus || !role) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required parameters" });
      }

      // ------------------------------------------------------------------------
      // ⚠️ Validate allowed availability values
      // ------------------------------------------------------------------------
      const validAvailability = ["Available", "SoldOut", "ComingSoon"];
      if (!validAvailability.includes(updateStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid availability. Allowed values are: ${validAvailability.join(
            ", "
          )}`,
        });
      }

      // ------------------------------------------------------------------------
      // ⚠️ Validate allowed roles
      // ------------------------------------------------------------------------
      const validRoles = ["manager", "staff", "guest"];
      if (!validRoles.includes(role.toLowerCase().trim())) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
        });
      }

      // ------------------------------------------------------------------------
      // 🔹 Get hotel key from request
      // ------------------------------------------------------------------------
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      if (!hotelKey) {
        return res
          .status(400)
          .json({ success: false, message: "Hotel key missing" });
      }

      // ------------------------------------------------------------------------
      // 🔹 Update Menu Item availability in DB
      // ------------------------------------------------------------------------
      const updatedItem = await Menu_Item.findOneAndUpdate(
        { hotelKey, _id: itemId, isDeleted: false },
        { availability: updateStatus.trim() },
        { new: true } // Return updated document
      );

      if (!updatedItem) {
        return res
          .status(404)
          .json({ success: false, message: "Menu item not found" });
      }

      const io = req.app.get("io") as SocketIOServer;
      await create_Notification(hotelKey, updatedItem, 'stockAlert', undefined, io);
console.log(updatedItem)
      // ------------------------------------------------------------------------
      // ✅ Send success response
      // ------------------------------------------------------------------------
      return res.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
      // ----------------------------------------------------------------------
      // ❌ Error handling
      // ----------------------------------------------------------------------
      console.error("Error updating menu item status:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

export default post_UpdateStatus_Stock_Table_Router;
