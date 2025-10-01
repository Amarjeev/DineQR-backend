import { Router, Response } from "express";
import { verifyToken } from "../middleware/verifyToken/verifyToken";
import { redis } from "../config/redis";
import Menu_Item from "../models/manager/mgr_MenuSchemaModel";
import { MultiUserRequest } from "../types/user";

const get_food_byId_Router = Router();

get_food_byId_Router.get(
  "/api/v1/:role/get/food/:dishId",
  verifyToken(""),
  async (req: MultiUserRequest, res: Response) => {
    try {
      const role = req.params.role ? req.params.role.toLowerCase().trim() : "";
      const dishId = req.params.dishId;

      if (!["manager", "staff", "guest"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Allowed roles are manager, staff, guest.",
        });
      }

      if (!role || !dishId) {
        return res
          .status(400)
          .json({ success: false, message: "Role and Dish Id are required" });
      }

      const hotelKey = req[role as keyof MultiUserRequest]?.hotelKey;
      const userId = req[role as keyof MultiUserRequest]?.userId;

      if (!hotelKey) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: hotel key not found",
        });
      }

      const redisKey = `foodData:${hotelKey}:${dishId}`;

      // Try Redis first
      const cachedData = await redis.get(redisKey);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      // Fetch from DB
      const foodItem = await Menu_Item.findById(dishId)
        .lean()
        .select("-createdAt -updatedAt -__v");
      if (!foodItem) {
        return res
          .status(404)
          .json({ success: false, message: "Food item not found" });
      }

      const response = {
        success: true,
        message: "Food item fetched successfully",
        data: foodItem,
        userId,
      };

      // Save to Redis (5 min)
      await redis.set(redisKey, JSON.stringify(response), { ex: 300 });

      return res.status(200).json(response);
    } catch (error: any) {
      console.error("Error fetching food item:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

export default get_food_byId_Router;
