import { Router, Response } from "express";
import { MultiUserRequest } from "./../../../types/user";
import { verifyToken } from "../../../middleware/verifyToken/verifyToken";
import { redis } from "../../../config/redis";

// ✅ Create a new router instance
const mgr_refresh_Table_Router = Router();

// ✅ Route: Refresh table list (clears Redis cache for manager tables)
mgr_refresh_Table_Router.post(
  "/api/v1/manager/refresh/table",
  verifyToken("manager"), // Middleware to verify manager token
  async (req: MultiUserRequest, res: Response) => {
    try {
      const hotelKey = req.manager?.hotelKey;
      const { PageNumber } = req.body;

      // ✅ Validate request
      if (!hotelKey || !PageNumber) {
        return res.status(400).json({
          message: "hotelKey and PageNumber are required",
          success: false,
        });
      }

      // ✅ Clear Redis cache for this hotel's table list up to the current page
      for (let page = 1; page <= PageNumber; page++) {
        const redisKey = `mgr_tableList_${hotelKey}_page${page}_limit20`;
        await redis.del(redisKey);
      }

      return res.status(200).json({
        message: "Table list refreshed successfully",
        success: true,
      });
    } catch (error) {
      console.error("❌ Error refreshing table list:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: (error as Error).message,
      });
    }
  }
);

export default mgr_refresh_Table_Router;
