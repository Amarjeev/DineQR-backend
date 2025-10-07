import { Router, Response } from "express";
import { verifyToken } from "../middleware/verifyToken/verifyToken";
import { redis } from "../config/redis";
import Menu_Item from "../models/manager/mgr_MenuSchemaModel";
import { MultiUserRequest } from "../types/user";

// ================================
// ✅ Express Router: Get Food Item by ID
// Returns detailed information of a food item by its dishId
// Supports Redis caching for faster responses
// ================================
const get_food_byId_Router = Router();

// ================================
// 🔹 GET Endpoint: /api/v1/:role/get/food/:dishId
// Middleware: verifyToken ensures valid JWT
// ================================
get_food_byId_Router.get(
  "/api/v1/:role/get/food/:dishId",
  verifyToken(""), // 🔹 Verify JWT token
  async (req: MultiUserRequest, res: Response) => {
    try {
      // 🔹 Extract role and dishId from route parameters
      const role = req.params.role ? req.params.role.toLowerCase().trim() : "";
      const dishId = req.params.dishId;

      // 🔹 Validate role
      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      // 🔹 Ensure both role and dishId are provided
      if (!role || !dishId) {
        return res.status(400).json({
          success: false,
          message: "Role and Dish Id are required",
        });
      }

      // 🔹 Extract hotelKey and userId from request based on role
      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      const userId = req[role as keyof MultiUserRequest]?.userId;

      // 🔹 Unauthorized if hotelKey missing
      if (!hotelKey) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: hotel key not found",
        });
      }

      // 🔹 Generate Redis cache key for this food item
      const redisKey = `foodData:${hotelKey}:${dishId}`;

      // 🔹 Try to return cached data first
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      // 🔹 Fetch food item from MongoDB
      const foodItem = await Menu_Item.findById(dishId)
        .lean() // Convert to plain JS object
        .select("-createdAt -updatedAt -__v"); // Exclude unnecessary fields

      // 🔹 If food item not found
      if (!foodItem) {
        return res
          .status(404)
          .json({ success: false, message: "Food item not found" });
      }

      // 🔹 Prepare response object
      const response = {
        success: true,
        message: "Food item fetched successfully",
        data: foodItem,
        userId,
      };

      // 🔹 Save response to Redis with 5-minute expiration
      await redis.set(redisKey, JSON.stringify(response), { ex: 300 });

      // 🔹 Send successful response
      return res.status(200).json(response);
    } catch (error: any) {
      console.error("Error fetching food item:", error);
      // 🔹 Return server error if something goes wrong
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

// ✅ Export router to use in main server file
export default get_food_byId_Router;
