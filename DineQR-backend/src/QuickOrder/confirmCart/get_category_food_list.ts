import { Router, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken/verifyToken";
import { redis } from "../../config/redis";
import Menu_Item from "../../models/manager/mgr_MenuSchemaModel";
import { MultiUserRequest } from "../../types/user";

// ================================
// ✅ Express Router: Get Food List by Category
// Returns a paginated list of food items based on user role and dish category
// Supports Redis caching for performance
// ================================
const get_category_food_list_Router = Router();

// ================================
// 🔹 GET Endpoint: /api/v1/:role/get/food-list/:dishName
// Middleware: verifyToken ensures user has valid JWT
// ================================
get_category_food_list_Router.get(
  "/api/v1/:role/get/food-list/:dishName",
  verifyToken(""), // 🔹 Middleware to verify JWT token
  async (req: MultiUserRequest, res: Response) => {
    try {
      // 🔹 Extract role and dishName from route parameters
      let role = req.params.role ? req.params.role.toLowerCase().trim() : "";
      let dishName = req.params.dishName
        ? req.params.dishName.toLowerCase().trim()
        : "";

      // 🔹 Validate role
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // 🔹 Ensure both role and dishName are provided
      if (!role || !dishName) {
        return res.status(400).json({
          success: false,
          message: "Role and Dish name are required",
        });
      }

      // 🔹 Get hotelKey from request (depends on user role)
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;

      // 🔹 Unauthorized if hotelKey missing
      if (!hotelKey) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // 🔹 Count total matching food items in MongoDB
      const totalCount = await Menu_Item.countDocuments({
        hotelKey,
        foodCategory: dishName,
        isDeleted: false,
      });

      // 🔹 Pagination: page & limit from query params or defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      // 🔹 Redis cache key for this query
      const redisKey = `foodlist:${hotelKey}:${dishName}:page${page}:limit${limit}`;

      // 🔹 Return cached data if available
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        return res
          .status(200)
          .json({ data: cachedData, success: true, totalCount });
      }

      // 🔹 Fetch data from MongoDB if cache is empty
      const response = await Menu_Item.find({
        hotelKey,
        foodCategory: dishName,
        isDeleted: false,
      })
        .lean() // Convert to plain JS object
        .select("productName foodCategory prices availability s3Url blurHash") // Only select required fields
        .skip(skip)
        .limit(limit);

      // 🔹 Store result in Redis for 5 minutes (300 seconds)
      await redis.set(redisKey, JSON.stringify(response), { ex: 300 });

      // 🔹 Send successful response
      return res
        .status(200)
        .json({ data: response, success: true, totalCount });
    } catch (error: any) {
      console.error("Error fetching food list:", error);
      // 🔹 Return server error response
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// ✅ Export router for use in main server file
export default get_category_food_list_Router;
