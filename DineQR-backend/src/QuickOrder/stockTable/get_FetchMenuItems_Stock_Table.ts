import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from "../../types/user";
import Menu_Item_Schema from "../../models/manager/mgr_MenuSchemaModel";

const get_FetchMenuItems_Stock_Table_Router = Router();

// ============================================================================
// 🎯 GET Stock Menu Items (with pagination)
// Route: /api/v1/:role/get/menue-itemse/:foodCategory/:availability
// Query Params: page (default 1), limit (default 10)
// ============================================================================
get_FetchMenuItems_Stock_Table_Router.get(
  "/api/v1/:role/get/menue-itemse/:foodCategory/:availability",
  verifyToken(""),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const { role, foodCategory, availability } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!role || !foodCategory || !availability) {
        res
          .status(400)
          .json({ success: false, message: "Missing required parameters" });
        return;
      }

      const validAvailability = ["Available", "SoldOut", "ComingSoon"];
      if (!validAvailability.includes(availability)) {
        res.status(400).json({
          success: false,
          message: `Invalid availability. Allowed values are:`,
        });
        return;
      }

      const validRoles = ["manager", "staff", "guest"];
      if (!validRoles.includes(role.toLowerCase().trim())) {
        res.status(400).json({
          success: false,
          message: `Invalid role. Allowed roles are `,
        });
        return;
      }

      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      if (!hotelKey) {
        res.status(400).json({ success: false, message: "Hotel key missing" });
        return;
      }

      // ==========================
      // 🔹 Fetch Menu Items from DB with pagination
      // ==========================
      const response = await Menu_Item_Schema.find({
        hotelKey,
        foodCategory: String(foodCategory).trim().toLowerCase(),
        availability: String(availability).trim(),
        isDeleted: false,
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .select(
          "productName availability foodCategory foodType blurHash s3Url"
        );

      // Send response
      res.json({ success: true, data: response });
      return;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
      return; 
    }
  }
);

export default get_FetchMenuItems_Stock_Table_Router;
