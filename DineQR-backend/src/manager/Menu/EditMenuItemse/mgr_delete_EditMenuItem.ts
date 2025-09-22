import { Router, Request, Response } from "express";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import Menu_Item from "../../../models/manager/mgr_MenuSchemaModel";
import { redis } from "../../../config/redis"; // Redis client instance

const mgr_delete_EditMenuItem = Router();

mgr_delete_EditMenuItem.post(
  "/api/v1/delete/edit-menuItems/:productid/:currentPage",
  verifyToken("manager"), // Verify manager token
  async (req: Request, res: Response) => {
    const { productid, currentPage } = req.params; // get product id from URL params

    try {
      // Check if the menu item exists
      const existingItem = await Menu_Item.findById({ _id: productid });
      if (!existingItem) {
        res.status(404).json({ message: "Menu item not found" });
        return;
      }

      // Mark the menu item as deleted
      existingItem.isDeleted = true;
      await existingItem.save();

      const pageNumber: number = Number(currentPage);

      for (let page: number = 1; page <= pageNumber; page++) {
        const MenuListRedisKey = `mgr_menu_list:${existingItem.foodCategory}:${pageNumber}:${existingItem.hotelKey}`;

        // Delete each redis key
        await redis.del(MenuListRedisKey);
      }

      // ✅ Clear related menu list cache for the manager to reflect changes
      const cacheKey = `mgr_menuItem${productid}`;
      await redis.del(cacheKey);

      res
        .status(200)
        .json({ message: "Menu item deleted successfully", success: true });
      return;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default mgr_delete_EditMenuItem;
