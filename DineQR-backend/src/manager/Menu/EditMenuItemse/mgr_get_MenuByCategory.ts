/**
 * @heading Manager Menu List API Router
 * @description
 * This Express router handles fetching a paginated list of menu items for a manager based on the food category.
 *
 * Features:
 * 1. Validates manager authentication using `verifyToken`.
 * 2. Validates the requested food category against predefined `foodCategories`.
 * 3. Supports pagination with default `page = 1` and `perPage = 12`.
 * 4. Only selects necessary fields (`productName`, `s3Url`, `blurHash`, `hotelKey`) for performance.
 * 5. Implements Redis caching to reduce database load and improve response times.
 * 6. Returns total count of menu items along with the paginated data.
 * 7. Handles errors gracefully with proper HTTP status codes and messages.
 */

import { Router, Response } from "express";
import Menu_Item_Schema from "../../../models/manager/mgr_MenuSchemaModel";
import { foodCategories } from "../../../controllers/CategoriesList/FoodCategory";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { MultiUserRequest } from './../../../types/user';
import { redis } from "../../../config/redis";

const mgr_get_MenuByCategory_Router = Router();

// ✅ Only fetch food image, name, and _id
mgr_get_MenuByCategory_Router.get(
  "/api/v1/manager/menu-list/:foodCategory",
  verifyToken("manager"),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;

      if (!hotelKey) {
        res.status(401).json({ error: "Unauthorized: Manager not found" });
        return;
      }

      const { foodCategory }: { foodCategory?: string } = req?.params;

      const categoryLower: string | undefined = foodCategory?.toLowerCase();

      // ✅ First, make sure categoryLower exists
      if (!categoryLower) {
        res.status(400).json({ error: "Food category is required" });
        return;
      }

      // ✅ Validate foodCategory
      if (!foodCategories.map((c) => c.toLowerCase()).includes(categoryLower)) {
        res.status(400).json({ error: "Invalid food category" });
        return;
      }

      // ✅ Pagination (default page = 1, perPage = 12)
      const page = parseInt(req.query.page as string) || 1;
      const perPage = 12;
      const skip = (page - 1) * perPage;

      const cacheKey = `mgr_menu_list:${categoryLower}:${page}:${hotelKey}`;

      // ✅ Try fetching from Redis
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        res.status(200).json(cachedData);
        return;
      }
      // ✅ Fetch matching menu items and count in parallel
      const [response, totalCount] = await Promise.all([
        Menu_Item_Schema.find({
          hotelKey,
          foodCategory,
          isDeleted: false,
        })
          .select("productName s3Url blurHash hotelKey")
          .skip(skip)
          .limit(12) // limit to 12 items
          .lean(),

        Menu_Item_Schema.countDocuments({
          hotelKey,
          foodCategory,
          isDeleted: false,
        }),
      ]);

      const responseData = {
        count: totalCount,
        data: response,
      };

      await redis.set(cacheKey, JSON.stringify(responseData), { ex: 300 });

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error fetching menu list:", error);
      res.status(500).json({ error: "Failed to fetch menu list" });
    }
  }
);

export default mgr_get_MenuByCategory_Router;
