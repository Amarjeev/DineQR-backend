/**
 * @heading Manager Get Current Menu Item Data for Editing
 * @description
 * This Express router fetches the current data of a single menu item for a manager to edit.
 *
 * Features:
 * 1. Protected route using `verifyToken` middleware to ensure only authenticated managers can access.
 * 2. Fetches a menu item by its `_id` from the database, only if it is not deleted (`isDeleted: false`).
 * 3. Returns proper HTTP status codes:
 *    - 400 if product ID is missing
 *    - 404 if menu item is not found
 *    - 200 with menu item data if found
 *    - 500 for unexpected server errors
 *
 * Purpose:
 * - Provides the current menu item data for pre-filling edit forms in the manager panel.
 */

import { Router, Request, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import Menu_Item from "../../../models/manager/mgr_MenuSchemaModel";
import { redis } from "../../../config/redis";
const mgr_get_MenuEdit_Router = Router();

// ✅ Route: Fetch single menu item by ID for editing
// Access: Manager only (protected by verifyToken middleware)
mgr_get_MenuEdit_Router.get(
  "/api/v1/menu-items/:productid",
  verifyToken("manager"),
  async (req: Request, res: Response) => {
    try {
      // Extract product ID from URL parameters
      const { productid }: { productid?: string } = req.params;

      if (!productid) {
        // If no ID is provided, return 400 Bad Request
        res.status(400).json({ message: "Product ID is required" });
        return;
      }
      const cacheKey = `mgr_menuItem${productid}`;
      const redisData = await redis.get(cacheKey);

      if (redisData) {
        res.status(200).json(redisData);
        return;
      }

      // Fetch menu item from database where it's not deleted
      const response = await Menu_Item.findOne({
        _id: productid,
        isDeleted: false,
      }).lean();

      if (!response) {
        // If no item found, return 404 Not Found
        res.status(404).json({ message: "Menu item not found" });
        return;
      }

      await redis.set(cacheKey, JSON.stringify(response), { ex: 3600 });

      // Return the found item
      res.status(200).json(response);
      return;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      // Return 500 Internal Server Error on unexpected issues
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default mgr_get_MenuEdit_Router;
