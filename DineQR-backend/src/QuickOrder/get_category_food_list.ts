import { Router, Response } from "express";
// import { foodCategories } from "../controllers/CategoriesList/FoodCategory";
import { verifyToken } from "../middleware/verifyToken/verifyToken";
import { redis } from "../config/redis";
import Menu_Item from "../models/manager/mgr_MenuSchemaModel";
import { MultiUserRequest } from "../types/manager";

const get_category_food_list_Router = Router();

// Route to fetch food list by role and dish name
get_category_food_list_Router.get(
  "/api/v1/:role/get/food-list/:dishName",
  verifyToken(""), // Middleware to verify JWT token
  async (req: MultiUserRequest, res: Response) => {
    try {
      // Get role and dishName from route parameters, normalize to lowercase
      let role = req.params.role ? req.params.role.toLowerCase().trim() : "";
      let dishName = req.params.dishName
        ? req.params.dishName.toLowerCase().trim()
        : "";

      // Validate that role is one of the allowed roles
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // Return error if either role or dishName is missing
      if (!role || !dishName) {
        return res.status(400).json({
          success: false,
          message: "Role and Dish name are required",
        });
      }

      // Get hotelKey from the request based on the role
      const hotelKey = req[role as keyof MultiUserRequest]?.id;

      // Return error if hotelKey not found (unauthorized access)
      if (!hotelKey) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: manager not found",
        });
      }

      // Get the total count of matching food items
      const totalCount = await Menu_Item.countDocuments({
        hotelKey,
        foodCategory: dishName,
        isDeleted: false,
      });

      //   Pagination: get page & limit from query params or default to page 1 & 12 items
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      // ✅ Generate a unique Redis key for caching based on hotel, dish, page & limit
      const redisKey = `foodlist:${hotelKey}:${dishName}:page${page}:limit${limit}`;

      // Check Redis cache first
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        return res
          .status(200)
          .json({ data: cachedData, success: true, totalCount });
      }

      // Fetch food items from MongoDB if not in Redis
      const response = await Menu_Item.find({
        hotelKey,
        foodCategory: dishName,
        isDeleted: false,
      })
        .lean() // Convert Mongoose documents to plain JS objects
        .select("productName foodCategory prices availability s3Url blurHash") // Select only needed fields
        .skip(skip) // Skip previous pages
        .limit(limit); // Limit items per page

      // Store the result in Redis with 5-minute expiration
      await redis.set(redisKey, JSON.stringify(response), { ex: 300 });

      // Send the response
      return res
        .status(200)
        .json({ data: response, success: true, totalCount });
    } catch (error: any) {
      console.error("Error fetching food list:", error);
      // Return server error if something goes wrong
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

export default get_category_food_list_Router;
